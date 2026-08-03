import { useEffect, useState } from "react";
import type { TocEntry } from "../routes.generated";
import { ListIcon } from "../lib/icons";

/**
 * "On this page". Measured @1440: three nested wrappers —
 *   #content-side-layout      x1104 304x748, sticky, top-[9.5rem], z-21
 *   #table-of-contents-layout 304 wide, pl-10, w-[19rem], max-h-full
 *   #table-of-contents        264 wide (w-[16.5rem]), -mt-10, inner pt-10 pb-4
 * The list hard-clips at max-h-full: no fade, no scrollbar, long TOCs are cut mid-line.
 *
 * Pages with no qualifying headings render no TOC at all, but the 304px column is still
 * reserved (8 of 35 pages).
 */
export function Toc({ toc }: { toc: TocEntry[] }) {
  const activeId = useActiveHeading(toc);

  // The reference highlights the active branch, not just the deepest entry: a current
  // depth-1 heading also greens its nearest preceding depth-0 ancestor.
  const activeBranch = new Set<string>();
  if (activeId) {
    activeBranch.add(activeId);
    const i = toc.findIndex((t) => t.id === activeId);
    if (i >= 0 && toc[i].depth > 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (toc[j].depth === 0) {
          activeBranch.add(toc[j].id);
          break;
        }
      }
    }
  }

  return (
    <div
      id="content-side-layout"
      className="hidden xl:flex xl:flex-col self-start sticky max-w-[28rem] z-21 h-[calc(100vh-9.5rem)] top-[9.5rem]"
    >
      <div
        id="table-of-contents-layout"
        className="z-10 hidden xl:flex box-border max-h-full pl-10 w-[19rem]"
      >
        {toc.length > 0 && (
          <div
            id="table-of-contents"
            className="min-w-0 relative text-gray-600 text-sm leading-6 w-[16.5rem] -mt-10"
          >
            <div data-component-part="scroll-area-viewport" className="size-full pt-10 pb-4 mint-scroll overflow-scroll">
              <div className="min-w-0 w-full space-y-2">
                <nav aria-labelledby="toc-heading">
                  <h2 id="toc-heading" className="m-0 font-normal">
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0 })}
                      className="text-gray-700 dark:text-gray-300 font-medium flex items-center space-x-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
                    >
                      <ListIcon className="size-3 shrink-0" />
                      <span>On this page</span>
                    </button>
                  </h2>
                  <div>
                    <ul id="table-of-contents-content" className="toc">
                      {toc.map((t) => {
                        const active = activeBranch.has(t.id);
                        const deepest = t.id === activeId;
                        return (
                          <li
                            key={t.id}
                            className="toc-item relative"
                            data-depth={t.depth}
                            {...(active
                              ? {
                                  "data-active": "true",
                                  ...(deepest ? { "data-active-deepest": "true" } : {}),
                                }
                              : {})}
                          >
                            <a
                              href={`#${encodeURIComponent(t.id)}`}
                              aria-current={active ? "location" : undefined}
                              style={t.depth > 0 ? { paddingLeft: "1rem" } : undefined}
                              className={
                                "break-words py-1 block " +
                                (active
                                  ? "text-primary dark:text-primary-light" +
                                    (t.depth === 0 ? " faux-bold-sm" : "")
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300")
                              }
                            >
                              {t.title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Scroll-spy: the last heading whose top is above the scroll-margin line. */
function useActiveHeading(toc: TocEntry[]): string | null {
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    if (!toc.length) return;
    const ids = toc.map((t) => t.id);
    const compute = () => {
      // A heading becomes current once it passes a third of the way up the viewport.
      // The 152px scroll-margin line alone lags the reference by one entry.
      const line = Math.max(160, window.innerHeight * 0.34);
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
        else break;
      }
      // at the very bottom of the page, activate the last visible heading
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
        const last = ids.filter((id) => document.getElementById(id)).pop();
        if (last) current = last;
      }
      setActive(current);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [toc]);

  return active;
}
