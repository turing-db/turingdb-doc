// Static site generation: render every route to dist/<route>/index.html.
//
// Emits real HTML per page (not an empty shell) so the site can be served by any static
// host, is indexable, and — importantly for the parity harness — paints its final layout
// without a client-side hydration shift.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const serverEntry = path.join(root, 'dist-ssr/entry-server.js');

if (!fs.existsSync(serverEntry)) {
  console.error(`[prerender] missing ${serverEntry} — run \`vite build --ssr\` first`);
  process.exit(1);
}

const { render } = await import(serverEntry);
const { pages } = await import(path.join(root, 'dist-ssr/routes.js')).catch(() => ({ pages: null }));

// Route list comes from the generated table; read it from source to avoid a second bundle.
const routesSrc = fs.readFileSync(path.join(root, 'src/routes.generated.ts'), 'utf8');
const routes = [...routesSrc.matchAll(/route:\s*"([^"]+)"/g)].map((m) => m[1]);

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  console.error('[prerender] dist/index.html has no empty #root to fill');
  process.exit(1);
}

let written = 0;
for (const route of routes) {
  let html;
  try {
    html = await render(route);
  } catch (err) {
    console.error(`[prerender] FAILED ${route}: ${err?.message ?? err}`);
    process.exitCode = 1;
    continue;
  }
  const page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const outDir = route === '/' ? dist : path.join(dist, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  written++;
}

// 404 fallback: the shell, so client routing can take over on unknown paths.
fs.writeFileSync(path.join(dist, '404.html'), template);

// Host config for the two common cases where directory-index resolution is not automatic.
fs.writeFileSync(
  path.join(dist, '_redirects'),
  '# Netlify / Cloudflare Pages: serve prerendered pages, fall back to the SPA shell\n/*  /index.html  200\n'
);
fs.writeFileSync(
  path.join(dist, 'nginx.conf.example'),
  `# nginx: serve the prerendered page for a clean URL, else fall back to the shell.
location / {
  root /srv/turingdb-docs;
  try_files $uri $uri/index.html /index.html;
}
# Long-cache immutable assets, always revalidate HTML.
location /assets/ { root /srv/turingdb-docs; expires 1y; add_header Cache-Control "public, immutable"; }
`
);

console.log(`[prerender] wrote ${written}/${routes.length} pages + 404.html`);
