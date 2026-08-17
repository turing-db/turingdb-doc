import { useState, type ReactNode } from "react";
import { CopyIcon, CheckIcon } from "../lib/icons";

/**
 * Single fenced code block.
 *
 * Structure and metrics measured from the live site:
 *   .code-block            mt-5 mb-8, radius 16px, 1px white/10 border, transparent bg
 *   [data-floating-buttons] absolute top-3 right-4, gap-1.5 — ALWAYS visible (not hover-gated)
 *   code-block-root        bg #0B0C0E, radius 16px, font-variant-ligatures: none
 *   viewport               py-3.5 px-4, overflow-x with the native scrollbar suppressed
 *   code                   padding-right = --code-padding-right
 *
 * Upstream ships two floating buttons (copy + Ask Assistant) which sets
 * --code-padding-right to 131px. With the assistant dropped we have one button, so the
 * value is 99px — the reflow the plan records as an intentional departure.
 */
export function CodeBlock({
  children,
  code,
  title,
  lang,
  inGroup = false,
  flush = false,
}: {
  children?: ReactNode;
  code?: string;
  title?: string;
  lang?: string;
  inGroup?: boolean;
  flush?: boolean;
}) {
  return (
    <div
      className={
        "code-block not-prose relative group min-w-0 " +
        (flush ? "" : "mt-5 mb-8 ") +
        (inGroup
          ? "w-full min-w-full max-w-full h-full max-h-full "
          : "rounded-2xl border border-gray-950/10 dark:border-white/10 ") +
        "text-gray-950 dark:text-gray-50 bg-transparent dark:bg-transparent"
      }
      data-language={lang}
      data-title={title}
      style={{ ["--code-padding-right" as string]: "99px" }}
    >
      <div
        data-floating-buttons="true"
        className="absolute top-3 right-4 flex items-center gap-1.5 print:hidden"
      >
        <div className="z-10 select-none">
          <CopyButton code={code ?? ""} />
        </div>
      </div>
      <div
        data-component-part="code-block-root"
        className={
          "w-0 min-w-full max-w-full h-full relative dark:bg-codeblock bg-white text-sm leading-6 " +
          (inGroup ? "rounded-[14px] " : "rounded-2xl ")
        }
        style={{ fontVariantLigatures: "none" }}
      >
        <div
          data-component-part="scroll-area-viewport"
          className="size-full rounded-[inherit] py-3.5 px-4 overflow-x-auto overflow-y-hidden mint-scroll"
        >
          <div className="min-w-full h-full">
            <div className="font-mono whitespace-pre leading-6 [&>pre]:m-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      data-testid="copy-code-button"
      aria-label="Copy the contents from the code block"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="group/copy-button size-6.5 min-w-0 flex items-center justify-center rounded-md"
    >
      {done ? (
        <CheckIcon className="size-4 shrink-0 text-gray-400 dark:text-white/60" />
      ) : (
        <CopyIcon className="size-4 shrink-0 text-gray-400 group-hover/copy-button:text-gray-500 dark:text-white/40 dark:group-hover/copy-button:text-white/60" />
      )}
    </button>
  );
}
