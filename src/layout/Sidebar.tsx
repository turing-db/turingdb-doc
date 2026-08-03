import { Link, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { navGroups } from "../routes.generated";

/**
 * Left navigation. Measured @1440: 288px wide (w-[18rem]) at x=32, sticky under the 112px
 * header, height 100dvh - 112px.
 *
 * Two details that are easy to miss and very visible if wrong:
 *  - the 32px gradient fade at the top is in NORMAL FLOW, not overlaid, which is why the
 *    first group header sits at y=144 (112 + 32);
 *  - the scroll container auto-scrolls the active item into view on load. On roughly
 *    two thirds of pages the reference sidebar is therefore already scrolled, showing a
 *    partially-clipped mid-list entry at the top rather than "Get Started".
 * Native scrollbars are suppressed; a thin overlay bar appears on hover/scroll instead.
 */
export function Sidebar({ inDrawer = false }: { inDrawer?: boolean }) {
  const { pathname } = useLocation();
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const vp = viewportRef.current;
    const li = activeRef.current;
    if (!vp || !li) return;
    // Fitted against the reference's per-page scroll offsets (ref2/styles/*.__meta
    // .sidebarScrollTop, 35 pages): an item that sits comfortably inside the viewport is
    // left alone, otherwise the list scrolls so the item lands ~0.44 of the way down.
    // Plain scrollIntoView (nearest or center) does not reproduce these offsets.
    const SLACK = 64;
    const REST_RATIO = 0.44;
    const max = Math.max(0, vp.scrollHeight - vp.clientHeight);
    const comfortablyVisible = li.offsetTop + li.offsetHeight <= vp.clientHeight - SLACK;
    vp.scrollTop = comfortablyVisible
      ? 0
      : Math.max(0, Math.min(Math.round(li.offsetTop - vp.clientHeight * REST_RATIO), max));
  }, [pathname]);

  return (
    <nav
      aria-label="Pages"
      id={inDrawer ? "sidebar-drawer" : "sidebar"}
      className={
        inDrawer
          ? "block w-full"
          : "z-20 hidden lg:block sticky self-start shrink-0 w-[18rem] top-28 h-[calc(100dvh-7rem)]"
      }
    >
      <div
        id="sidebar-content"
        className={inDrawer ? "min-w-0" : "min-w-0 absolute inset-0 z-10"}
      >
        <div
          ref={viewportRef}
          data-component-part="scroll-area-viewport"
          className="size-full overflow-scroll pr-8 pb-10 mint-scroll"
        >
          <div className="min-w-0 w-full">
            <div className="relative lg:text-sm lg:leading-6">
              {/* in-flow 32px fade */}
              {!inDrawer && (
                <div className="sticky top-0 h-8 pointer-events-none z-10 bg-linear-to-b from-background-light dark:from-background-dark" />
              )}
              <div id="navigation-items">
                {navGroups.map((g, gi) => (
                  <div key={g.group} className={gi === 0 ? undefined : "mt-6 lg:mt-8"}>
                    <div className="sidebar-group-header flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-900 dark:text-gray-200">
                      <h3 className="sidebar-title text-[length:inherit] font-[inherit] leading-[inherit]">
                        <span>{g.group}</span>
                      </h3>
                    </div>
                    <ul className="sidebar-group space-y-px">
                      {g.pages.map((p) => {
                        const active = p.route === pathname;
                        return (
                          <li
                            key={p.route}
                            id={p.route}
                            ref={active ? activeRef : undefined}
                            className="relative scroll-m-4 first:scroll-m-20"
                            data-title={p.sidebarTitle}
                            {...(active
                              ? { "data-active": "true", "data-active-nav-item": "true" }
                              : {})}
                          >
                            <Link
                              to={p.route}
                              style={{ paddingLeft: "1rem" }}
                              aria-current={active ? "page" : undefined}
                              className={
                                "group flex items-start pr-3 py-1.5 cursor-pointer gap-x-3 text-left break-words hyphens-auto rounded-xl w-full outline-offset-[-1px] " +
                                (active
                                  ? "bg-primary/10 text-primary faux-bold dark:text-primary-light dark:bg-primary-light/10"
                                  : "hover:bg-gray-600/5 dark:hover:bg-gray-200/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300")
                              }
                            >
                              <div className="flex-1 flex min-w-0 items-start gap-x-2.5">
                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 [word-break:break-word]">
                                  <span className="min-w-0 max-w-full break-words hyphens-auto">
                                    {p.sidebarTitle}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
