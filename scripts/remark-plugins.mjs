// Remark transforms that must run BEFORE the mdast->hast conversion.
import { visit } from 'unist-util-visit';

/**
 * Turn every fenced code block into <CodeBlock lang title>…</CodeBlock>.
 *
 * Two reasons this has to happen at the remark stage:
 *  1. `node.meta` (the fence's title, e.g. ```bash uv add) is dropped by
 *     mdast-util-to-hast unless explicitly carried over — without it the CodeGroup on the
 *     home page renders five unlabelled tabs.
 *  2. The transform is unconditional over all ~390 fences, so the component never has to
 *     be reached by mapping `pre` in the MDX provider. Mapping `pre` as well would
 *     double-wrap the five titled fences (two copy buttons, doubled radius and margins).
 *
 * The inner <pre> is left in place so @shikijs/rehype still highlights it.
 */
export function remarkCodeBlocks() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.lang === 'mermaid') return; // handled by remarkMermaid
      const attrs = [
        { type: 'mdxJsxAttribute', name: 'lang', value: node.lang || 'text' },
      ];
      if (node.meta) attrs.push({ type: 'mdxJsxAttribute', name: 'title', value: node.meta });
      attrs.push({ type: 'mdxJsxAttribute', name: 'code', value: node.value });
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'CodeBlock',
        attributes: attrs,
        children: [{ ...node, meta: null }],
        data: { _mdxExplicitJsx: true },
      };
      return ['skip'];
    });
  };
}

/**
 * ```mermaid fences -> <Mermaid chart="…" />.
 * Must precede the rehype/shiki pass: `mermaid` is one of Shiki's bundled languages, so
 * left alone the four diagrams get syntax-highlighted instead of rendered.
 */
export function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || index === null || node.lang !== 'mermaid') return;
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [{ type: 'mdxJsxAttribute', name: 'chart', value: node.value }],
        children: [],
        data: { _mdxExplicitJsx: true },
      };
      return ['skip'];
    });
  };
}

/**
 * Rename HTML-cased attributes on inline JSX elements to their React forms.
 * The one <iframe> in the content is authored with `frameborder` / `allowfullscreen`;
 * React warns about both. Renaming here keeps the .mdx sources untouched.
 */
const ATTR_RENAMES = {
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  allowtransparency: 'allowTransparency',
  marginwidth: 'marginWidth',
  marginheight: 'marginHeight',
  referrerpolicy: 'referrerPolicy',
  srcdoc: 'srcDoc',
  tabindex: 'tabIndex',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
};

export function remarkJsxAttrCase() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;
      for (const attr of node.attributes || []) {
        if (attr.type !== 'mdxJsxAttribute') continue;
        const to = ATTR_RENAMES[attr.name];
        if (to) attr.name = to;
      }
    });
  };
}

/**
 * Collect headings into an exported `tableOfContents`, using the same slugger the runtime
 * uses, and set the id on the heading itself.
 *
 * Mirrors the live site's inclusion rules, established by comparing __meta.headings with
 * __meta.tocHrefs on all 35 pages:
 *   - markdown h1-h3 are included
 *   - <Card> titles are NOT (they are h2.not-prose with React-generated ids)
 *   - <Step> titles are included only when the Steps block sets titleSize="h2"
 *   - headings inside the 2nd and later <Tab> of a Tabs block are NOT
 */
export function remarkTocAndSlugs({ Slugger }) {
  return (tree, file) => {
    const slugger = new Slugger();
    const toc = [];

    // Depth-first, but skip subtrees we must not slug or index.
    const walk = (node, ctx) => {
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const name = node.name;
        if (name === 'Tabs') {
          // only the first Tab contributes headings
          let tabIndex = 0;
          for (const child of node.children || []) {
            const isTab = child.type === 'mdxJsxFlowElement' && child.name === 'Tab';
            const nextCtx = { ...ctx, suppress: ctx.suppress || (isTab && tabIndex > 0) };
            walk(child, nextCtx);
            if (isTab) tabIndex++;
          }
          return;
        }
        if (name === 'Steps') {
          const titleSize = (node.attributes || []).find(
            (a) => a.type === 'mdxJsxAttribute' && a.name === 'titleSize'
          )?.value;
          for (const child of node.children || []) {
            if (child.type === 'mdxJsxFlowElement' && child.name === 'Step') {
              const title = (child.attributes || []).find(
                (a) => a.type === 'mdxJsxAttribute' && a.name === 'title'
              )?.value;
              const size =
                (child.attributes || []).find(
                  (a) => a.type === 'mdxJsxAttribute' && a.name === 'titleSize'
                )?.value ?? titleSize;
              if (typeof title === 'string' && size === 'h2' && !ctx.suppress) {
                const id = slugger.slug(title);
                child.attributes.push({ type: 'mdxJsxAttribute', name: 'id', value: id });
                toc.push({ depth: 0, id, title });
              }
            }
            walk(child, ctx);
          }
          return;
        }
      }
      if (node.type === 'heading' && node.depth <= 3) {
        const title = toText(node);
        if (!ctx.suppress && title) {
          const id = slugger.slug(title);
          node.data = node.data || {};
          node.data.hProperties = { ...(node.data.hProperties || {}), id };
          toc.push({ depth: node.depth <= 2 ? 0 : 1, id, title });
        }
      }
      for (const child of node.children || []) walk(child, ctx);
    };

    walk(tree, { suppress: false });

    tree.children.push({
      type: 'mdxjsEsm',
      value: `export const tableOfContents = ${JSON.stringify(toc)};`,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [],
              source: null,
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'tableOfContents' },
                    init: jsonToEstree(toc),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}

function toText(node) {
  let out = '';
  visit(node, (n) => {
    if (n.type === 'text' || n.type === 'inlineCode') out += n.value;
  });
  return out.trim();
}

function jsonToEstree(value) {
  if (Array.isArray(value)) {
    return { type: 'ArrayExpression', elements: value.map(jsonToEstree) };
  }
  if (value && typeof value === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(value).map(([k, v]) => ({
        type: 'Property',
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        key: { type: 'Literal', value: k },
        value: jsonToEstree(v),
      })),
    };
  }
  return { type: 'Literal', value };
}
