declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const frontmatter: {
    title?: string;
    sidebarTitle?: string;
    description?: string;
  };
  export const tableOfContents: { depth: number; id: string; title: string }[];
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
