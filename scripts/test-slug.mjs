// Verifies the slugger still produces the exact heading ids the previously published site
// used, so in-page and cross-page anchors keep resolving.
//
// Checks against scripts/fixtures/anchors.json, which is committed — so this runs anywhere,
// including CI, with no captured snapshot needed. Regenerate the fixture with:
//
//   node scripts/test-slug.mjs --update      (requires the reference capture)
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FIXTURE = path.join(root, 'scripts/fixtures/anchors.json');
const REF =
  process.env.REF ||
  '/tmp/claude-1001/-home-ubuntu-doc/2c93b371-c73f-4152-a81d-392a543bb2ad/scratchpad/ref2/styles';

const bundle = await esbuild.build({
  entryPoints: [path.join(root, 'src/lib/slugify.ts')],
  bundle: true,
  write: false,
  format: 'esm',
  target: 'node22',
  platform: 'node',
});
const { Slugger } = await import(
  'data:text/javascript;base64,' +
    Buffer.from(bundle.outputFiles[0].text).toString('base64')
);

/** Read { page: [[headingText, expectedId], …] } out of the reference capture. */
function readReference() {
  const out = {};
  for (const f of fs.readdirSync(REF).filter((n) => n.endsWith('.json'))) {
    const meta = JSON.parse(fs.readFileSync(path.join(REF, f), 'utf8')).__meta;
    if (!meta?.headings?.length) continue;
    const pairs = meta.headings
      // React useId values (card titles) are not real anchors
      .filter((h) => h.id && !/^_r_/.test(h.id))
      .map((h) => [JSON.parse(h.x), h.id]);
    if (pairs.length) out[f.replace(/\.json$/, '')] = pairs;
  }
  return out;
}

if (process.argv.includes('--update')) {
  if (!fs.existsSync(REF)) {
    console.error(`[test-slug] cannot update: reference capture not found at ${REF}`);
    process.exit(1);
  }
  const data = readReference();
  fs.mkdirSync(path.dirname(FIXTURE), { recursive: true });
  fs.writeFileSync(FIXTURE, JSON.stringify(data, null, 1) + '\n');
  const n = Object.values(data).reduce((a, v) => a + v.length, 0);
  console.log(`[test-slug] wrote ${n} anchors across ${Object.keys(data).length} pages`);
  process.exit(0);
}

if (!fs.existsSync(FIXTURE)) {
  console.error(`[test-slug] missing fixture ${path.relative(root, FIXTURE)}`);
  console.error('[test-slug] regenerate it with: node scripts/test-slug.mjs --update');
  process.exit(1);
}

const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
let total = 0;
let ok = 0;
const fails = [];

for (const [page, pairs] of Object.entries(fixture)) {
  // One slugger per page: duplicate suffixes are scoped to a page.
  const slugger = new Slugger();
  for (const [text, want] of pairs) {
    const got = slugger.slug(text);
    total++;
    if (got === want) ok++;
    else fails.push({ page, text, want, got });
  }
}

console.log(`ANCHOR PARITY: ${ok}/${total}`);
for (const f of fails.slice(0, 12)) {
  console.log(`  [${f.page}] ${JSON.stringify(f.text)}\n    want ${f.want}\n    got  ${f.got}`);
}
if (fails.length > 12) console.log(`  … and ${fails.length - 12} more`);
process.exit(fails.length ? 1 : 0);
