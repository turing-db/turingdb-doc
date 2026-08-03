# TuringDB docs — self-hosted

A static React app that renders the `.mdx` files in this repository with the same design as the
Mintlify-hosted site it replaces. No Mintlify, no build service, no runtime dependency on any
external host.

```bash
cd site
npm install
npm run build      # -> dist/  (static, 35 prerendered pages)
npm run preview    # http://localhost:4173
npm run dev        # dev server with HMR
```

## What it is

| | |
|---|---|
| build | Vite 6 + React 19 + TypeScript |
| content | the existing `.mdx` files at the repo root — **unchanged**, still the source of truth |
| navigation | driven by `../docs.json`, same as Mintlify |
| markdown | `@mdx-js/rollup`, compiled at build time |
| code highlighting | Shiki, dual theme `github-light-default` / `dark-plus` — the same library and themes Mintlify used |
| diagrams | Mermaid, lazy-loaded |
| search | MiniSearch over a build-time index (`src/search-index.generated.json`) |
| styling | Tailwind CSS v4 + `@tailwindcss/typography`, tokens in `src/theme.css` |
| output | `dist/<route>/index.html` per page, plus `404.html` |

## Adding or moving a page

1. Add the `.mdx` file anywhere in the repo.
2. Reference it from `docs.json` under the right group.
3. Rebuild. `scripts/gen-routes.mjs` regenerates the route table, nav tree and search index.

Files not listed in `docs.json` are deliberately not routed — `benchmarks/benchmarks.mdx`,
`tutorials/create_graph.mdx` and `snippets/snippet-intro.mdx` are currently in that state.

## Hosting

`dist/` is fully static. It needs one rewrite rule so clean URLs resolve.

- **nginx** — see the generated `dist/nginx.conf.example`
- **Netlify / Cloudflare Pages** — the generated `dist/_redirects` is already correct
- **S3 + CloudFront** — set the index document to `index.html` and add a CloudFront function (or
  an S3 static-website-hosting rule) mapping `/path` to `/path/index.html`; set the error document
  to `404.html`

Assets under `/assets/` are content-hashed and safe to cache forever. HTML should revalidate.

## Where the design lives

`src/theme.css` is the whole design system: the colour ramp, fonts, the prose rhythm, and the
port of the repo's `style.css`. Every non-obvious value in it was measured off the live Mintlify
render, and the comments say why. The two things most likely to surprise you:

- The rules are deliberately **unlayered**. `@tailwindcss/typography` emits into
  `@layer utilities`, so anything in `@layer components` loses to it.
- Mintlify applies a global "everything that isn't a heading uses the body weight" rule, so every
  `font-semibold` in the markup is inert and **bold is signalled by colour, not weight**. Three
  places opt out: the TOC header, card titles, and code inside headings.

## Verifying against the original

```bash
node scripts/compare.mjs --geometry   # computed styles + geometry, 136 selectors x 35 pages
node scripts/compare.mjs --pixels     # scrolled-viewport screenshot diffs
node scripts/test-slug.mjs            # heading anchors match the old site exactly (293/293)
```

The harness compares against a captured snapshot of the live site under
`.../scratchpad/ref2/` (computed styles, class inventories, 679 screenshots). It normalises
colours through a canvas and de-duplicates font stacks first, because the reference reports alpha
colours as `oklab()` and its font-family strings arrive doubled — without that a correct build
scores ~30%.

Current state: **99.75%** of 134,416 geometry assertions pass; mean per-slice pixel difference
**1.08%**.

## Deliberate differences from the old site

1. **No AI assistant.** The navbar "Ask Assistant" button, the sparkle button on every code
   block, and the floating "Ask a question…" bar are all Mintlify SaaS features with no
   self-hosted equivalent, so they are gone. Consequences: the search field is wider, code blocks
   have 99px of right padding instead of 131px, and every page is 86px shorter.
2. **No "Powered by Mintlify".**
3. **Code font is IBM Plex Mono** (OFL) rather than Mintlify's proprietary paperMono. Measured
   side by side these render an identical 8.0px advance at 14px, so code aligns character for
   character; only letterforms differ slightly. To switch fonts, change `--font-mono` in
   `theme.css`.
4. **Footer social icons are inline SVGs** instead of CSS masks fetched from a FontAwesome CDN.
5. **Images are served locally.** The old site proxied them through an image CDN, which
   incidentally disabled the repo's own `image-rendering: pixelated` rule on the pixel-art card
   icons. Served locally the rule applies, so those icons are now crisp — which is what
   `style.css` always asked for.

## Known residuals

- Sidebar auto-scroll lands within ~3px of the original on 4 of 35 pages (exact on the rest). The
  rule was fitted to the original's measured per-page offsets; no simple `scrollIntoView` mode
  reproduces them.
- Cumulative vertical drift up to ~35px on the longest pages (`quickstart`,
  `concepts/versioning_system`), from small residual spacing differences inside `Steps`.
- Wide tables clip their last column rather than scrolling visibly. This is faithful to the
  original (5 columns at `min-width: 150px` inside a 689px column, with the scrollbar hidden) and
  is a fix candidate, not a port bug.
- `h4` styling is unverified: no page in the corpus uses one, so its values come from the
  typography scale plus the repo's heading overrides.
