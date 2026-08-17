# TuringDB docs

The TuringDB documentation: the content plus the static site that renders it. No Mintlify, no
build service, no runtime dependency on any external host.

```bash
npm install
npm run build      # -> dist/  (static, 35 prerendered pages)
npm run preview    # http://localhost:4173
npm run dev        # dev server with HMR
```

## Layout

```
docs.json              navigation, colours, logo, navbar links, footer socials
*.mdx                  the docs — index, quickstart, claude-skill, commands, …
benchmarks/ concepts/ graph_dev/ import_data/ pythonsdk/ query/ troubles/ tutorials/
public/                everything served verbatim: images/, logo/, fonts/, favicon.png
src/                   the app
scripts/               build steps and the parity harness
deploy/                nginx config used by the Docker image
Dockerfile             build + serve; railway.json points at it
```

Content and app share one root, so the `.mdx` files sit next to `src/`. `index.html` is the app
shell; `index.mdx` is the docs home page.

## What it is

| | |
|---|---|
| build | Vite 6 + React 19 + TypeScript |
| content | the `.mdx` files in this repo — the source of truth |
| navigation | driven by `docs.json` |
| markdown | `@mdx-js/rollup`, compiled at build time |
| code highlighting | Shiki, dual theme `github-light-default` / `dark-plus` |
| diagrams | Mermaid, lazy-loaded |
| search | MiniSearch over a build-time index |
| styling | Tailwind CSS v4 + `@tailwindcss/typography`, tokens in `src/theme.css` |
| output | `dist/<route>/index.html` per page, plus `404.html` |

## Adding or moving a page

1. Add the `.mdx` file anywhere in the repo.
2. Reference it from `docs.json` under the right group.
3. Rebuild.

`docs.json` is the index — nothing is discovered by globbing the filesystem.
`scripts/gen-routes.mjs` walks it, resolves each slug to `<root>/<slug>.mdx`, and **fails the
build** if a referenced file is missing. Files not listed are simply never routed:
`benchmarks/benchmarks.mdx` and `tutorials/create_graph.mdx` are currently in that state.

Images go in `public/images/` and are referenced from `.mdx` as `/images/…`.

## Hosting

`dist/` is fully static. It needs one rewrite rule so clean URLs resolve.

- **nginx** — see the generated `dist/nginx.conf.example`, or use the Docker image
- **Netlify / Cloudflare Pages** — the generated `dist/_redirects` is already correct
- **S3 + CloudFront** — index document `index.html`, error document `404.html`, plus a rule
  mapping `/path` to `/path/index.html`
- **Railway** — pushes to `main` deploy automatically via
  `.github/workflows/deploy.yml`; `railway up` from this directory does it by hand.
  `railway.json` selects the Dockerfile.

Assets under `/assets/` and `/fonts/` are content-hashed or never edited in place and are served
`immutable`; HTML revalidates.

## Where the design lives

`src/theme.css` is the whole design system: the colour ramp, the fonts, the prose rhythm, and
the site-specific touches (pixel cursor, type scale, card treatment) that used to live in
a separate `style.css`. Every non-obvious value in it was measured off the previous render, and
the comments say why. The two things most likely to surprise you:

- The rules are deliberately **unlayered**. `@tailwindcss/typography` emits into
  `@layer utilities`, so anything in `@layer components` loses to it.
- A global "everything that isn't a heading uses the body weight" rule means most
  `font-semibold` in the markup is inert. Five things opt out: the two nav labels (downwards,
  to 300), card titles, code inside headings, and `<strong>`.

Body-copy brightness is one token, `--color-prose-text` (currently `gray-200`, 15.5:1 against
the page background). Every rule that paints prose text reads it, so that one line dials the
whole site. Sidebar, TOC and navbar stay dimmer on purpose, for hierarchy.

Typography is split by job, across four `--font-*` tokens:

| token | face | carries |
|---|---|---|
| `--font-heading` | IBM Plex Sans | page titles, `h1`–`h6`, step titles |
| `--font-nav-label` | IBM Plex Sans | sidebar group titles, "On this page" |
| `--font-body` / `--font-nav` | IBM Plex Sans | body copy, sidebar page links, TOC entries |
| `--font-mono` | IBM Plex Mono | code |

One family, in three registers of weight:

| | size | weight |
|---|---|---|
| page title / `h1` / `h2` | 36 / 30 / 24px | 300 |
| nav labels | 16px | 300 |
| `h3`–`h6`, body copy, nav items | 20px and below | 400 |

Light is a display weight, so the rule is that it applies where something other than weight
carries the hierarchy. On the titles that is size: at 36px and 24px Light has composure, but at
20px against 16px body copy a 300-weight heading is physically thinner than the paragraph it
introduces and the hierarchy runs backwards. The cut-off is 24px, asserted in two places — the
prose block and the `#content-area` rule — because the `!important` that beats `font-semibold`
would otherwise flatten it. On the two nav labels it is colour: they sit at `gray-200`/`gray-300`
over `gray-400` items, and hold `1rem` against 14px items, so a lighter weight still reads as a
label. Note that "On this page" is an `<h2>` in the DOM but reads `--font-nav-label` rather than
the heading stack, which is what lets the titles and the labels move independently.

Ark Pixel — the 16px bitmap face the original used for the titles, the nav labels and the TOC —
is **still shipped and applied nowhere**. Point `--font-heading` or `--font-nav-label` at
`"Ark Pixel"` to bring it back. If you do: it is crisp at 16px and its multiples and mushy
below, so pin whatever takes it to a multiple of 16; and it has exactly one weight, so nothing
on it may ask for bold — measured in Chromium, 500 is pixel-for-pixel identical to 400 and 600
smears every stem.

## CI

`.github/workflows/deploy.yml`:

- **pull requests to `main`** — build check only: `npm run gen`, `tsc --noEmit`,
  the anchor test, `npm run build`, and an assertion that all 35 pages prerendered.
- **pushes to `main`** — the same check, then `railway up`, then it waits until the live
  `index.html` byte-matches this commit's build and smoke-tests four routes plus a 404.
  Deploys never run from a pull request.

Requires one repository secret, **`RAILWAY_TOKEN`** — a Railway *project* token for the
`production` environment (Railway dashboard → project → Settings → Tokens). Without it the
deploy job fails immediately with a message saying so, rather than half-deploying.

## Verifying the rendering

```bash
node scripts/compare.mjs --geometry   # computed styles + geometry, 136 selectors x 35 pages
node scripts/compare.mjs --pixels     # scrolled-viewport screenshot diffs
node scripts/test-slug.mjs            # heading anchors match the previous site (293/293)
```

`compare.mjs` diffs against a captured snapshot of the old hosted site. That snapshot is not in
this repo, so the geometry and pixel modes only run where it exists.

`test-slug.mjs` runs anywhere, including CI: it checks against `scripts/fixtures/anchors.json`,
a committed record of all 293 heading ids the old site published. Regenerate it with
`node scripts/test-slug.mjs --update` (needs the snapshot) if the content's headings change.

Last measured: **99.62%** of 127,354 geometry assertions pass, with 6 critical failures; mean
per-slice pixel difference **4.09%**. The pixel figure is dominated by the type changes below:
no text on the page is set the way the original set it, so almost every slice differs a little
everywhere. For scale, as the titles moved: Ark Pixel 3.76%, Plex Light 3.94%, and 4.09% once
the nav labels followed.

## Deliberate differences from the previously hosted site

1. **No AI assistant.** The navbar "Ask Assistant" button, the sparkle button on every code
   block, and the floating "Ask a question…" bar were SaaS features with no self-hosted
   equivalent. Consequences: the search field is wider, code blocks have 99px of right padding
   instead of 131px, and every page is 86px shorter.
2. **No vendor attribution in the footer.**
3. **Code font is IBM Plex Mono** (OFL) rather than the proprietary paperMono. Measured side by
   side these render an identical 8.0px advance at 14px, so code aligns character for character;
   only letterforms differ slightly. To switch, change `--font-mono` in `theme.css`.
4. **Footer social icons are inline SVGs** instead of CSS masks fetched from a FontAwesome CDN.
5. **Card icons are crisply pixelated.** The old host proxied images through a CDN, which
   incidentally disabled the `image-rendering: pixelated` rule on the pixel-art icons. Served
   locally the rule applies — which is what it always asked for.
6. **The Guides card grid has 16px spacing.** The previous CSS forced `gap: 0`, so the cards
   butted into a single slab.
7. **Body copy is brighter** — `gray-200` rather than `gray-400`, 15.5:1 against the background
   instead of 7.9:1. `<strong>` consequently carries weight 600 and pure white: at that body
   brightness, the original's colour-only emphasis separates by 1.27:1, which is invisible.
8. **Ark Pixel is not applied.** The original set the titles, the nav labels and the TOC entries
   in a 16px bitmap face; all of them are IBM Plex Sans now — the titles Light at -0.01em rather
   than 400 at +0.06em, the nav labels Light with no tracking, the TOC entries at 14px. The two
   nav labels keep the original's 16px, which was a pixel-grid accommodation and is now what
   separates a label from the 14px list beneath it. The font file is still shipped.
9. **Body copy is Regular (400), not Light (300)**, and emphasis uses a true italic instead of
   a synthesised oblique — the original loaded only the Light cut of IBM Plex Sans, so every
   bold and italic on the page was synthesised. This is the one change that reflows prose.

## Known residuals

- Sidebar auto-scroll is within 2px of the original on all 35 pages, exact on 23. The rule was
  fitted to the measured per-page offsets; no simple `scrollIntoView` mode reproduces them.
- Cumulative vertical drift up to ~35px on the longest pages (`quickstart`,
  `concepts/versioning_system`), from small residual spacing differences inside `Steps`.
- Wide tables clip their last column rather than scrolling visibly. This is faithful to the
  original (5 columns at `min-width: 150px` inside a 689px column, scrollbar hidden) and is a
  fix candidate, not a port bug.
- `h4` styling is unverified: no page uses one, so its values come from the typography scale
  plus the heading overrides.
