#!/usr/bin/env node
/**
 * Parity harness: compares this app against the captured docs.turingdb.ai reference.
 *
 *   node scripts/compare.mjs --geometry [--pages a,b] [--top N]
 *   node scripts/compare.mjs --pixels   [--pages a,b]
 *   node scripts/compare.mjs --report
 *
 * Values are normalised before comparison, because the reference's computed values are not
 * literally reproducible: font-family strings arrive doubled (Next.js font var + Tailwind
 * fallback), and alpha colours come back as oklab()/color-mix() rather than rgba(). Without
 * normalisation a correct build reports ~30% pass and the harness is useless.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRATCH = process.env.SCRATCH ||
  '/tmp/claude-1001/-home-ubuntu-doc/2c93b371-c73f-4152-a81d-392a543bb2ad/scratchpad';
const REF_STYLES = path.join(SCRATCH, 'ref2/styles');
const REF_SLICES = path.join(SCRATCH, 'ref2/slices');
const OUT = path.join(SCRATCH, 'parity');
const BASE = process.env.BASE || 'http://localhost:4173';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };

fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ selectors */
// Reference-side selectors are Mintlify-shaped. Where our DOM uses a different hook, the
// alias maps ref -> ours. Everything else is identical by construction (we mirror their
// ids and data-component-part attributes so this harness can work at all).
const ALIAS = {
  p: '.mdx-content > p',
  pAny: '.mdx-content p',
  link: '.mdx-content a.link',
  navContainer: '#navbar .max-w-8xl',
  navRow1: '#navbar .h-16',
  sidebarFade: '#sidebar .sticky.top-0.h-8',
  tableInner: '[data-table-wrapper] .table',
  cbFade: null,            // upstream-only (fade overlay belongs to the 2-button layout)
  assistant: null,         // dropped by design
  assistantLabel: null,
  assistantBar: null,
  mobileBar: '#navbar button.h-14',
  picture: '.mdx-content picture',
  cgTabLabel: '[role="tablist"][aria-label="Code examples"] button > div',
};

// Zero failures allowed on these; they define the page's skeleton and its prose.
const CRITICAL = new Set([
  'html', 'body', 'navbar', 'navTransition', 'navRow1', 'search',
  'sidebar', 'sidebarGroupHeader', 'sidebarUl', 'sidebarLink', 'sidebarLinkActive', 'sidebarFade',
  'main', 'rowWrap', 'contentSideLayout', 'tocLayout', 'toc', 'tocLink', 'tocHeaderBtn',
  'contentArea', 'pageHeader', 'eyebrow', 'pageTitle', 'pageDesc', 'mdxContent',
  'h1', 'h2', 'h3', 'p', 'strong', 'em', 'link', 'ul', 'li', 'ol', 'oli',
  'blockquote', 'hr', 'inlineCode', 'pre', 'code',
  'codeBlock', 'cbRoot', 'cbFloating',
  'callout', 'calloutContent',
  'steps', 'step', 'stepLine', 'stepNumberInner', 'stepTitle',
  'tabsList', 'tabButton', 'tabPanel',
  'card', 'cardGroup', 'cardTitle', 'cardContent', 'cardImage',
  'tableBleed', 'table', 'thead', 'th', 'td', 'tbodyTr',
  'pagination', 'footer',
]);

// Properties changed on purpose (PLAN §7). Excluded per selector, never globally.
const INTENTIONAL = {
  search: 'ALL',
  searchKbd: 'ALL',
  cbFloating: ['width', '__rect'],
  cbCopyBtn: ['__rect'],
  cbCopySvg: ['__rect'],   // single button sits where upstream's second one was
  code: ['paddingRight'],
  footer: ['__rect'],
  footerSocials: ['__rect'],
  footerSocialA: ['__rect'],
  footerSocialSvg: 'ALL',
  pagination: ['__rect'],
  pagSvg: 'ALL',
  html: ['fontFamily', 'height'],  // reference html carries the Inter stack we do not ship
  // Removing the 86px sticky assistant bar shortens every page by exactly that much
  // (PLAN §7.2), so page-level container heights are expected to differ.
  body: ['height'],
  main: ['height'],
  rowWrap: ['height'],
  contentArea: ['height'],
  // IBM Plex Mono + a 0.005em advance compensation replaces paperMono (PLAN §7.1)
  inlineCode: ['fontFamily', 'paddingRight'],  // probe matches pre>code on some pages
  tbodyCode: ['fontFamily'],
  pre: ['fontFamily'],
  code: ['fontFamily', 'paddingRight', 'width', '__rect'],  // 99px vs 131px right pad
  codeLine: ['fontFamily'],
  cbRoot: ['fontFamily'],
  codeBlock: ['fontFamily'],
};

const GEOM = ['__rect'];
const PROPS_CHECK = [
  'display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
  'letterSpacing', 'textTransform', 'textAlign', 'textDecorationLine',
  'color', 'backgroundColor', 'opacity',
  'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
  'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderRadius',
  'gap', 'flexDirection', 'alignItems', 'justifyContent', 'gridTemplateColumns',
  'overflowX', 'overflowY', 'zIndex', 'whiteSpace', 'listStyleType', 'verticalAlign',
  'width', 'height', 'maxWidth', 'minWidth',
];

/* ------------------------------------------------------------------ normalisation */
// Colour canonicalisation. The reference reports alpha colours as oklab()/color-mix() while
// we emit rgba(); they are the same paint. Every distinct colour string from both sides is
// resolved through a canvas in Chromium, which yields a comparable 8-bit sRGB value.
const COLOR_CACHE = new Map();
let colorPage = null;

async function canonicaliseColors(values) {
  const need = [...new Set(values)].filter((v) => v && !COLOR_CACHE.has(v));
  if (!need.length) return;
  if (!colorPage) {
    const b = await chromium.launch();
    const ctx = await b.newContext();
    colorPage = await ctx.newPage();
    colorPage._browser = b;
  }
  const resolved = await colorPage.evaluate((list) => {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const g = c.getContext('2d', { willReadFrequently: true });
    return list.map((v) => {
      try {
        g.clearRect(0, 0, 1, 1);
        g.fillStyle = '#000';
        g.fillStyle = v;
        if (g.fillStyle === '#000' && !/^#0{3,8}$|black|rgb\(0, 0, 0\)/i.test(v)) return null;
        g.clearRect(0, 0, 1, 1);
        g.fillRect(0, 0, 1, 1);
        const d = g.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3]].join(',');
      } catch { return null; }
    });
  }, need);
  need.forEach((v, i) => COLOR_CACHE.set(v, resolved[i]));
}

function isColorProp(prop) {
  return /[Cc]olor$/.test(prop) || prop === 'backgroundColor';
}

function normColor(v) {
  if (typeof v !== 'string') return v;
  const c = COLOR_CACHE.get(v);
  if (!c) return v.replace(/\s+/g, '');
  // tolerate 1/255 round-trip error from oklab -> sRGB
  const p = c.split(',').map(Number);
  return p.map((n) => Math.round(n / 2)).join(',');
}
function normFont(v) {
  if (typeof v !== 'string') return v;
  const seen = new Set();
  const parts = v.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const uniq = parts.filter((p) => (seen.has(p) ? false : (seen.add(p), true)));
  return uniq.join(',');
}
function normPx(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/(-?\d+\.?\d*)px/g, (_, n) => `${Math.round(parseFloat(n) * 2) / 2}px`);
}
function normalise(prop, v) {
  if (v == null) return v;
  if (prop === 'fontFamily') return normFont(v);
  if (isColorProp(prop)) return normColor(String(v));
  if (/boxShadow|backgroundImage/.test(prop)) return String(v).replace(/\s+/g, '');
  return normPx(String(v));
}

/* ------------------------------------------------------------------ probe */
const PROBE = fs.readFileSync(path.join(SCRATCH, 'tools/probe-shared.js'), 'utf8');

async function probeOurs(pages) {
  const refSel = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'tools/selectors.json'), 'utf8'));
  const sel = {};
  for (const [k, v] of Object.entries(refSel)) {
    if (k in ALIAS) { if (ALIAS[k]) sel[k] = ALIAS[k]; }
    else sel[k] = v;
  }
  const browser = await chromium.launch();
  const out = {};
  for (const p of pages) {
    const url = p === 'index' ? '/' : '/' + p;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    out[p] = await page.evaluate(new Function('return ' + PROBE)(), { sel, props: [...new Set([...PROPS_CHECK, 'boxShadow', 'backgroundImage'])] });
    await ctx.close();
  }
  await browser.close();
  return out;
}

/* ------------------------------------------------------------------ geometry mode */
async function geometry(pages) {
  const ours = await probeOurs(pages);

  // gather every colour value from both sides and canonicalise in one pass
  const colorValues = [];
  const harvest = (obj) => {
    for (const v of Object.values(obj || {})) {
      if (!v || typeof v !== 'object') continue;
      for (const [prop, val] of Object.entries(v)) {
        if (isColorProp(prop) && typeof val === 'string') colorValues.push(val);
      }
    }
  };
  for (const p of pages) {
    const f = path.join(REF_STYLES, `${p.replace(/\//g, '__')}.json`);
    if (fs.existsSync(f)) harvest(JSON.parse(fs.readFileSync(f, 'utf8')));
    harvest(ours[p]);
  }
  await canonicaliseColors(colorValues);
  if (colorPage?._browser) await colorPage._browser.close();

  const rows = [];
  let pass = 0, fail = 0, critFail = 0, skipped = 0;

  for (const p of pages) {
    const slug = p.replace(/\//g, '__');
    const refFile = path.join(REF_STYLES, `${slug}.json`);
    if (!fs.existsSync(refFile)) continue;
    const ref = JSON.parse(fs.readFileSync(refFile, 'utf8'));
    const our = ours[p] || {};

    for (const [key, refVal] of Object.entries(ref)) {
      if (key === '__meta') continue;
      if (key in ALIAS && ALIAS[key] === null) { skipped++; continue; }
      if (!refVal) { skipped++; continue; }            // reference-null => nothing to match
      const ourVal = our[key];
      const intent = INTENTIONAL[key];
      if (intent === 'ALL') { skipped++; continue; }

      if (!ourVal) {
        rows.push({ page: p, key, prop: '(missing)', ref: refVal.__tag ?? 'present', our: 'MISSING', crit: CRITICAL.has(key) });
        fail++; if (CRITICAL.has(key)) critFail++;
        continue;
      }

      // rect
      if (!(Array.isArray(intent) && intent.includes('__rect'))) {
        for (const axis of ['x', 'y', 'w']) {
          const a = refVal.__rect?.[axis], b = ourVal.__rect?.[axis];
          if (a == null || b == null) continue;
          const d = Math.abs(a - b);
          if (d <= 2) pass++;
          else {
            fail++; if (CRITICAL.has(key)) critFail++;
            rows.push({ page: p, key, prop: `rect.${axis}`, ref: a, our: b, delta: +(b - a).toFixed(1), crit: CRITICAL.has(key) });
          }
        }
      }

      for (const prop of PROPS_CHECK) {
        if (Array.isArray(intent) && intent.includes(prop)) continue;
        if (!(prop in refVal)) continue;
        const a = normalise(prop, refVal[prop]);
        const b = normalise(prop, ourVal[prop]);
        const near = (() => {
          const ma = /^(-?\d+\.?\d*)px$/.exec(String(refVal[prop]));
          const mb = /^(-?\d+\.?\d*)px$/.exec(String(ourVal[prop]));
          return ma && mb && Math.abs(parseFloat(ma[1]) - parseFloat(mb[1])) <= 1;
        })();
        if (a === b || near) pass++;
        else {
          fail++; if (CRITICAL.has(key)) critFail++;
          rows.push({ page: p, key, prop, ref: refVal[prop], our: ourVal[prop], crit: CRITICAL.has(key) });
        }
      }
    }
  }

  const total = pass + fail;
  const pct = total ? ((pass / total) * 100).toFixed(2) : '0';
  console.log(`\nGEOMETRY  pass ${pass}/${total} (${pct}%)   fail ${fail}   critical-fail ${critFail}   skipped ${skipped}\n`);

  // group failures by (key, prop) so systemic issues surface first
  const groups = new Map();
  for (const r of rows) {
    const k = `${r.crit ? '!' : ' '} ${r.key} · ${r.prop}`;
    if (!groups.has(k)) groups.set(k, { ...r, n: 0, pages: [] });
    const g = groups.get(k);
    g.n++;
    if (g.pages.length < 3) g.pages.push(r.page);
  }
  const sorted = [...groups.entries()].sort((a, b) => (b[1].crit - a[1].crit) || (b[1].n - a[1].n));
  const top = Number(val('--top', '45'));
  for (const [k, g] of sorted.slice(0, top)) {
    const ref = String(g.ref).slice(0, 46), our = String(g.our).slice(0, 46);
    console.log(`${k}  ×${g.n}\n    ref  ${ref}\n    ours ${our}${g.delta !== undefined ? `   Δ${g.delta}` : ''}   [${g.pages.join(', ')}]`);
  }
  fs.writeFileSync(path.join(OUT, 'geometry.json'), JSON.stringify({ pass, fail, critFail, total, pct, rows }, null, 2));
  return { pass, fail, critFail, pct };
}

/* ------------------------------------------------------------------ pixel mode */
async function pixels(pages) {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(OUT, 'diff'), { recursive: true });
  const results = [];
  for (const p of pages) {
    const slug = p.replace(/\//g, '__');
    const refs = fs.existsSync(REF_SLICES)
      ? fs.readdirSync(REF_SLICES).filter((f) => f.startsWith(`${slug}.desktop.s`)).sort()
      : [];
    if (!refs.length) continue;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + (p === 'index' ? '/' : '/' + p), { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2200);
    await page.evaluate(() => document.fonts.ready);
    // Our pages are exactly 86px shorter than the reference (the removed sticky assistant
    // bar, PLAN §7.2). A reference offset past our max scroll cannot be aligned by scrolling,
    // so those bottom-anchored slices are skipped rather than reported as a huge diff.
    const ourMax = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    for (const f of refs) {
      const y = parseInt(f.match(/\.s(\d+)\.png$/)[1], 10);
      if (y > ourMax + 1) {
        results.push({ page: p, y, pct: null, note: `skipped: past our max scroll (${ourMax})` });
        continue;
      }
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(650);
      const buf = await page.screenshot();
      const a = PNG.sync.read(fs.readFileSync(path.join(REF_SLICES, f)));
      const b = PNG.sync.read(buf);
      if (a.width !== b.width || a.height !== b.height) {
        results.push({ page: p, y, pct: 100, note: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` });
        continue;
      }
      const diff = new PNG({ width: a.width, height: a.height });
      const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.12, includeAA: true });
      const pct = (n / (a.width * a.height)) * 100;
      results.push({ page: p, y, pct: +pct.toFixed(2) });
      if (pct > 1.5) fs.writeFileSync(path.join(OUT, 'diff', `${slug}.s${y}.png`), PNG.sync.write(diff));
    }
    await ctx.close();
  }
  await browser.close();
  const scored = results.filter((r) => r.pct != null);
  const skipped = results.filter((r) => r.pct == null);
  scored.sort((a, b) => b.pct - a.pct);
  const bad = scored.filter((r) => r.pct > 1.5);
  const mean = scored.length ? scored.reduce((a, r) => a + r.pct, 0) / scored.length : 0;
  console.log(`\nPIXELS  ${scored.length} slices compared, ${skipped.length} skipped, ` +
    `${bad.length} over the 1.5% budget, mean ${mean.toFixed(2)}%\n`);
  for (const r of scored.slice(0, 30)) {
    console.log(`  ${r.pct.toFixed(2).padStart(6)}%  ${r.page} @y=${r.y}${r.note ? '  ' + r.note : ''}`);
  }
  for (const r of skipped) console.log(`  skipped  ${r.page} @y=${r.y}  ${r.note}`);
  fs.writeFileSync(path.join(OUT, 'pixels.json'), JSON.stringify(results, null, 2));
  return results;
}

/* ------------------------------------------------------------------ main */
const allPages = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'ref2/pages.json'), 'utf8'));
const pageArg = val('--pages', null);
const pages = pageArg ? pageArg.split(',') : allPages;

if (has('--geometry')) await geometry(pages);
if (has('--pixels')) await pixels(pages);
if (!has('--geometry') && !has('--pixels')) {
  console.log('usage: compare.mjs --geometry | --pixels  [--pages a,b] [--top N]');
}
