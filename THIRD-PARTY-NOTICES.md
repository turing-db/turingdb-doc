# Third-party notices

## Bundled fonts

Font binaries are served from `public/fonts/`. All are under the SIL Open Font License 1.1,
which permits redistribution and bundling.

| file | family | licence | source |
|---|---|---|---|
| `IBMPlexMono-Light.woff2`, `IBMPlexMono-Regular.woff2` | IBM Plex Mono | OFL-1.1 — © 2017 IBM Corp., Reserved Font Name "Plex" | <https://github.com/IBM/plex> |
| `IBMPlexSans-{Light,Regular,Italic,SemiBold}.woff2` | IBM Plex Sans | OFL-1.1 — © 2017 IBM Corp., Reserved Font Name "Plex" | <https://github.com/IBM/plex> |
| `ArkPixel16px-Latin.woff2` | Ark Pixel | OFL-1.1 | <https://github.com/TakWolf/ark-pixel-font> |

Ark Pixel carries the two nav labels only — the sidebar group titles and the TOC header. See
the `--font-nav-label` comment in `src/theme.css`.

All font files live in `public/fonts/` and are tracked in git. Ark Pixel and IBM Plex Sans Light
came with the original design; IBM Plex Mono and the Regular / Italic / SemiBold cuts of IBM
Plex Sans were added by this app.

Full licence text: <https://openfontlicense.org/open-font-license-official-text/>

### Not bundled

The Mintlify-hosted site set code in **paperMono**, a proprietary face served from Mintlify's
CDN. It is deliberately not redistributed here. IBM Plex Mono replaces it; measured side by
side the two render an identical 8.0px advance at 14px, so code alignment is unchanged.

## Runtime dependencies

Declared in `package.json`. The notable ones and their licences:

| package | licence |
|---|---|
| react, react-dom, react-router | MIT |
| vite, @vitejs/plugin-react | MIT |
| @mdx-js/rollup, @mdx-js/react | MIT |
| shiki, @shikijs/rehype | MIT |
| tailwindcss, @tailwindcss/vite, @tailwindcss/typography | MIT |
| remark-gfm, remark-frontmatter, remark-mdx-frontmatter, remark-smartypants | MIT |
| rehype-autolink-headings, unist-util-visit | MIT |
| mermaid | MIT |
| minisearch | MIT |
| playwright, pixelmatch, pngjs (dev/verification only) | Apache-2.0 / ISC / MIT |

## Syntax highlighting themes

Shiki is configured with `github-light-default` and `dark-plus`, the same two themes the
Mintlify site used. Both ship with Shiki (MIT); `dark-plus` derives from VS Code's default dark
theme (MIT, © Microsoft).
