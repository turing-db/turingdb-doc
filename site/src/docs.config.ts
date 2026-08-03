// Typed view of the repo's docs.json, so the app is driven by the same config Mintlify was.
import raw from "../../docs.json";

export type DocsConfig = {
  name: string;
  colors: { primary: string; light: string; dark: string };
  logo: { light: string; dark: string };
  favicon: string;
  navbar: { links: { label: string; href: string }[] };
  footer: { socials: Record<string, string> };
};

const cfg = raw as unknown as DocsConfig;

export const siteName = cfg.name;
export const colors = cfg.colors;
export const logo = cfg.logo;
export const favicon = cfg.favicon;
export const navbarLinks = cfg.navbar?.links ?? [];
export const footerSocials = cfg.footer?.socials ?? {};

/** Order matters — it is the order the reference footer renders them in. */
export const SOCIAL_ORDER = ["github", "linkedin", "youtube", "discord"] as const;
