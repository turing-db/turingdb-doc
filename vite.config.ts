import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeShiki from "@shikijs/rehype";
import { fileURLToPath } from "node:url";
import path from "node:path";
// plain-JS plugin module
// @ts-ignore
import {
  remarkCodeBlocks,
  remarkMermaid,
  remarkTocAndSlugs,
  remarkJsxAttrCase,
} from "./scripts/remark-plugins.mjs";
import { Slugger } from "./src/lib/slugify";

const root = path.dirname(fileURLToPath(import.meta.url));
// The app now lives at the repository root, so the content root is the project root.
const contentRoot = root;
const SSR = Boolean(process.env.SSR_BUILD);

/**
 * In the SSR build, keep the React runtime as bare external imports. Vite's alias rewrites
 * them to absolute paths, which makes rollup bundle a second copy — and two React instances mean
 * "Cannot read properties of null (reading 'useContext')" during prerender.
 */
const EXTERNAL_RUNTIME = /^(react|react-dom|react-router|@mdx-js\/react|mermaid|minisearch)(\/|$)/;
const keepReactExternal = () => ({
  name: "keep-react-external-ssr",
  enforce: "pre" as const,
  resolveId(id: string) {
    return EXTERNAL_RUNTIME.test(id) ? { id, external: true } : null;
  },
});

export default defineConfig({
  plugins: [
    {
      // must run before @vitejs/plugin-react so .mdx is already JSX by the time
      // the react transform sees it
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkGfm,
          // Mintlify applies typographic replacement: "x" -> “x”, -- -> –, ... -> …
          [remarkSmartypants, { dashes: "oldschool" }],
          remarkJsxAttrCase,
          [remarkTocAndSlugs, { Slugger }],
          remarkMermaid,
          remarkCodeBlocks,
        ],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: "github-light-default", dark: "dark-plus" },
              // Mintlify maps bash -> shellscript; everything else resolves directly.
              langAlias: { bash: "shellscript" },
              // keep the light colour inline + a --shiki-dark custom property, exactly as
              // the reference does; theme.css promotes the dark one under .dark
              defaultColor: "light",
              cssVariablePrefix: "--shiki-",
            },
          ],
        ],
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
    tailwindcss(),
    ...(SSR ? [keepReactExternal()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@content": contentRoot,
      // The .mdx sources sit alongside src/ but are resolved through the @content alias;
      // these aliases keep a single React copy for everything. Not applied in the SSR
      // build — see keepReactExternal above.
      ...(SSR
        ? {}
        : {
            "react/jsx-runtime": path.resolve(root, "node_modules/react/jsx-runtime.js"),
            "react/jsx-dev-runtime": path.resolve(root, "node_modules/react/jsx-dev-runtime.js"),
            "@mdx-js/react": path.resolve(root, "node_modules/@mdx-js/react/index.js"),
            react: path.resolve(root, "node_modules/react"),
            "react-dom": path.resolve(root, "node_modules/react-dom"),
          }),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: { allow: [root] },
  },
  build: {
    outDir: SSR ? "dist-ssr" : "dist",
    emptyOutDir: !SSR,
    ...(SSR
      ? {
          ssr: "src/entry-server.tsx",
          ssrEmitAssets: false,
        }
      : {}),
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/mermaid")) return "mermaid";
          if (id.includes("node_modules/minisearch")) return "search";
        },
      },
    },
  },
});
