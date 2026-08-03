import { Children, cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/**
 * CodeGroup: tabbed code blocks whose labels come from each fence's meta string
 * (```bash uv add). The wrapper is p-0.5 with dark:bg-white/5 — a 2px light ring around
 * the panel, which is the visible seam in the reference. Tab strip is text-xs, gap-1,
 * first tab ml-2.5, active tab gets a 2px primary-light underline.
 */
export function CodeGroup({ children }: { children?: ReactNode }) {
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement<{
    title?: string;
    lang?: string;
  }>[];
  const [active, setActive] = useState(0);

  if (!blocks.length) return null;

  return (
    <div className="code-group not-prose relative mt-5 mb-8 p-0.5 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-gray-950/5 dark:bg-white/5 flex flex-col min-w-0 text-gray-950 dark:text-gray-50">
      <div className="min-w-0 overflow-x-auto mint-scroll">
        <div style={{ minWidth: "fit-content" }}>
          <div
            role="tablist"
            aria-label="Code examples"
            className="text-xs leading-6 gap-1 flex min-w-0"
          >
          {blocks.map((b, i) => {
            const label = b.props.title ?? b.props.lang ?? `Tab ${i + 1}`;
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                data-active={isActive ? "" : undefined}
                onClick={() => setActive(i)}
                className={
                  "group flex items-center relative gap-1.5 my-1 mb-1.5 outline-0 whitespace-nowrap font-medium first:ml-2.5 focus-visible:outline-2 " +
                  (isActive
                    ? "text-primary dark:text-primary-light"
                    : "text-gray-500 dark:text-gray-400")
                }
              >
                <div className="peer/title flex items-center gap-1.5 px-1.5 rounded-lg z-10 group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/70 group-hover:text-primary dark:group-hover:text-primary-light">
                  {label}
                </div>
                {isActive && (
                  <div className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary dark:bg-primary-light peer-empty/title:hidden" />
                )}
              </button>
            );
            })}
          </div>
        </div>
      </div>
      {blocks.map((b, i) => (
        <div
          key={i}
          role="tabpanel"
          hidden={i !== active}
          className={i === active ? "block" : "hidden"}
        >
          {cloneElement(b as ReactElement<Record<string, unknown>>, { inGroup: true, flush: true })}
        </div>
      ))}
    </div>
  );
}

/** Used by the MDX provider so CodeBlock children inside a group render flush. */
export function GroupedCodeBlock(props: Parameters<typeof CodeBlock>[0]) {
  return <CodeBlock {...props} inGroup flush />;
}
