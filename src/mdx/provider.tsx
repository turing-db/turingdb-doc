import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router";
import { LinkIcon } from "../lib/icons";
import { Note, Tip, Check, Warning, Info } from "./Callout";
import { Steps, Step } from "./Steps";
import { Tabs, Tab } from "./Tabs";
import { Card, CardGroup } from "./Card";
import { CodeBlock } from "./CodeBlock";
import { CodeGroup } from "./CodeGroup";
import { Mermaid } from "./Mermaid";

/**
 * Heading with the hover-revealed anchor chip in the left gutter. Upstream prefixes the
 * text with U+200B (the anchor's zero-width space) — reproduced so heading widths and
 * text-content comparisons match.
 */
function heading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return function Heading({ id, children, ...rest }: ComponentPropsWithoutRef<"h2">) {
    return (
      <Tag
        id={id}
        className="flex whitespace-pre-wrap group font-semibold"
        style={{ scrollMarginTop: "var(--scroll-mt)" }}
        {...rest}
      >
        {id && (
          <div className="absolute" tabIndex={-1}>
            <a
              href={`#${encodeURIComponent(id)}`}
              className="-ml-10 flex items-center opacity-0 border-0 group-hover:opacity-100 focus:opacity-100 focus:outline-0 group/link"
              aria-label="Navigate to header"
            >
              ​
              <div className="size-6 rounded-md flex items-center justify-center shadow-xs text-gray-400 dark:text-white/50 dark:bg-background-dark dark:brightness-[1.35] dark:ring-1 bg-white ring-1 ring-gray-400/30 dark:ring-gray-700/25 hover:ring-gray-400/60 dark:hover:ring-white/20">
                <LinkIcon className="size-3 shrink-0" />
              </div>
            </a>
          </div>
        )}
        <span className="cursor-pointer">{children}</span>
      </Tag>
    );
  };
}

/**
 * Tables bleed 20px outside the prose column and scroll horizontally with the native
 * scrollbar suppressed. Inside a <Tab> the bleed is reset to 0 (see Tabs.tsx).
 */
function Table({ children, ...rest }: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      data-table-wrapper=""
      className="min-w-0 relative flex my-[1em] py-[1em] max-w-none [contain:inline-size]"
      style={{
        ["--page-padding" as string]: "20px",
        width: "calc(100% + (var(--page-padding) * 2))",
        marginInline: "calc(var(--page-padding) * -1)",
      }}
    >
      <div className="size-full rounded-[inherit] overflow-x-auto overflow-y-hidden mint-scroll">
        <div className="flex">
          <div
            className="grow max-w-none table"
            style={{ paddingInline: "var(--page-padding)" }}
          >
            <table
              className="m-0 min-w-full w-full max-w-none table"
              {...rest}
            >
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Internal links go through the router; external ones open in a new tab. */
function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const internal = /^\//.test(href);
  const hash = href.startsWith("#");
  if (internal) {
    return (
      <Link to={href} className="link" {...(rest as object)}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="link"
      {...(hash ? {} : { target: "_blank", rel: "noreferrer" })}
      {...rest}
    >
      {children}
    </a>
  );
}

function Img({ src, alt, ...rest }: ComponentPropsWithoutRef<"img">) {
  return (
    <span data-rmiz="">
      <span data-rmiz-content="">
        <picture className="contents">
          <img src={src} alt={alt ?? ""} className="object-contain" {...rest} />
        </picture>
      </span>
    </span>
  );
}

function Iframe(props: ComponentPropsWithoutRef<"iframe">) {
  return <iframe {...props} />;
}

export const mdxComponents = {
  h1: heading("h1"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  h5: heading("h5"),
  h6: heading("h6"),
  a: Anchor,
  table: Table,
  img: Img,
  iframe: Iframe,
  // block components
  Note,
  Tip,
  Check,
  Warning,
  Info,
  Steps,
  Step,
  Tabs,
  Tab,
  Card,
  CardGroup,
  CodeBlock,
  CodeGroup,
  Mermaid,
  // Mintlify aliases that appear in the content
  Frame: ({ children }: { children?: ReactNode }) => <div className="my-4">{children}</div>,
};
