import { Link } from "react-router";
import { useEffect, useState } from "react";
import { logo, navbarLinks, siteName } from "../docs.config";
import { tabs } from "../routes.generated";
import { MagnifierIcon, MenuIcon, ChevronRightIcon } from "../lib/icons";

type Props = {
  onOpenSearch: () => void;
  onOpenDrawer: () => void;
  group: string;
  title: string;
};

/**
 * Navbar geometry (measured @1440): 1440x112 total = a 64px row plus a 48px tabs row,
 * sticky at lg and above, fixed below. Backdrop is a separate absolutely-positioned layer
 * that cross-fades over 500ms once the page is scrolled (data-is-opaque upstream).
 *
 * The upstream "Ask Assistant" button is intentionally absent — see PLAN §7. Its removal
 * lets the search field take the full centre column, which is the one deliberate navbar
 * departure from the reference.
 */
export function Navbar({ onOpenSearch, onOpenDrawer, group, title }: Props) {
  const [opaque, setOpaque] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onScroll = () => setOpaque(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className="z-30 fixed lg:sticky top-0 w-full"
    >
      <div
        id="navbar-transition"
        data-is-opaque={opaque ? "true" : "false"}
        className="absolute w-full h-full flex-none transition-colors duration-500 border-b border-gray-500/5 dark:border-gray-300/[0.06] bg-background-light dark:bg-background-dark"
      />
      <div className="max-w-8xl mx-auto relative">
        <div>
          <div className="relative">
            <div className="flex items-center lg:px-12 h-16 min-w-0 mx-4 lg:mx-0">
              <div className="h-full relative flex-1 flex items-center gap-x-4 min-w-0 border-b border-gray-500/5 dark:border-gray-300/[0.06]">
                <div className="flex-1 flex items-center gap-x-4">
                  <Link className="select-none" to="/">
                    <span className="sr-only">{siteName} home page</span>
                    <img
                      className="nav-logo w-auto h-7 relative object-contain shrink-0 block dark:hidden"
                      src={logo.light}
                      alt="light logo"
                    />
                    <img
                      className="nav-logo w-auto h-7 relative object-contain shrink-0 hidden dark:block"
                      src={logo.dark}
                      alt="dark logo"
                    />
                  </Link>
                </div>

                <div className="relative hidden lg:flex items-center flex-1 z-20 gap-2.5">
                  <button
                    type="button"
                    id="search-bar-entry"
                    aria-label="Open search"
                    onClick={onOpenSearch}
                    className="group/search flex pointer-events-auto rounded-xl w-full items-center text-sm leading-6 h-9 pl-3.5 pr-3 text-gray-500 dark:text-white/50 bg-background-light dark:bg-background-dark dark:brightness-[1.1] dark:ring-1 dark:hover:brightness-[1.25] ring-1 ring-gray-400/30 hover:ring-gray-600/30 dark:ring-gray-600/30 dark:hover:ring-gray-500/30 justify-between truncate gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <MagnifierIcon className="size-4 shrink-0" />
                      <div className="truncate min-w-0">Search...</div>
                    </div>
                    <span className="flex-none text-xs font-semibold">
                      {isMac ? "⌘K" : "Ctrl K"}
                    </span>
                  </button>
                </div>

                <div className="flex-1 relative hidden lg:flex items-center ml-auto justify-end space-x-4">
                  <nav aria-label="Main" className="text-sm">
                    <ul className="flex space-x-6 items-center">
                      {navbarLinks.map((l) => (
                        <li key={l.href} className="navbar-link">
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 whitespace-nowrap font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <span className="min-w-0 truncate">{l.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <div className="flex items-center" />
                </div>

                <div className="flex lg:hidden items-center gap-3">
                  <button
                    type="button"
                    id="search-bar-entry-mobile"
                    aria-label="Open search"
                    onClick={onOpenSearch}
                    className="text-gray-500 w-8 h-8 flex items-center justify-center hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Search...</span>
                    <MagnifierIcon className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* mobile breadcrumb / drawer trigger — 56px */}
            <button
              type="button"
              onClick={onOpenDrawer}
              className="flex items-center h-14 py-4 px-5 lg:hidden focus:outline-0 w-full text-left"
            >
              <div className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                <span className="sr-only">Navigation</span>
                <MenuIcon className="size-4" />
              </div>
              <div className="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0 space-x-3 overflow-hidden">
                <div className="flex items-center space-x-3 shrink-0">
                  <span>{group}</span>
                  <ChevronRightIcon className="size-3 shrink-0" />
                </div>
                <div className="font-semibold text-gray-900 truncate dark:text-gray-200 min-w-0 flex-1">
                  {title}
                </div>
              </div>
            </button>
          </div>

          {/* tabs row — 48px */}
          <div className="hidden lg:flex px-12 h-12">
            <div className="nav-tabs h-full flex text-sm gap-x-6">
              {tabs.map((t) => (
                <Link
                  key={t}
                  to="/"
                  data-active="true"
                  aria-current="location"
                  className="link nav-tabs-item group relative h-full gap-2 flex items-center font-medium hover:text-gray-800 dark:hover:text-gray-300 text-gray-800 dark:text-gray-200 faux-bold"
                >
                  {t}
                  <div className="absolute bottom-0 h-[1.5px] w-full left-0 bg-primary dark:bg-primary-light" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
