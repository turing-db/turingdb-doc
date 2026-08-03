// Sync content-owned assets from the repo root into public/.
//
// These are the content's assets, not the app's, so they are derived rather than duplicated:
// editing images/ or logo/ in the repo automatically flows through to the site, and the git
// tree (and the Railway upload) doesn't carry two copies of every PNG.
//
// App-owned files already in public/ — the IBM Plex Mono faces this app introduced — are
// left alone.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentRoot = path.resolve(root, '..');
const publicDir = path.join(root, 'public');

/** [source relative to the repo root, destination relative to public/] */
const ASSETS = [
  ['images', 'images'],
  ['logo', 'logo'],
  ['favicon.png', 'favicon.png'],
  ['fonts/ArkPixel16px-Latin.woff2', 'fonts/ArkPixel16px-Latin.woff2'],
  ['fonts/IBMPlexSans-Light.woff2', 'fonts/IBMPlexSans-Light.woff2'],
];

let files = 0;
let bytes = 0;

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  // Skip when the destination is already identical, so repeat builds are cheap.
  const src = fs.statSync(from);
  if (fs.existsSync(to)) {
    const dst = fs.statSync(to);
    if (dst.size === src.size && dst.mtimeMs >= src.mtimeMs) return;
  }
  fs.copyFileSync(from, to);
  files++;
  bytes += src.size;
}

function copyTree(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name);
    const t = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(f, t);
    else if (entry.isFile()) copyFile(f, t);
  }
}

for (const [src, dst] of ASSETS) {
  const from = path.join(contentRoot, src);
  const to = path.join(publicDir, dst);
  if (!fs.existsSync(from)) {
    console.error(`[copy-assets] missing content asset: ${src}`);
    process.exitCode = 1;
    continue;
  }
  if (fs.statSync(from).isDirectory()) copyTree(from, to);
  else copyFile(from, to);
}

console.log(
  `[copy-assets] ${files} file(s) refreshed (${(bytes / 1048576).toFixed(1)} MB)`
);
