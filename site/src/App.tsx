import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { MDXProvider } from "@mdx-js/react";
import { pages, byRoute, type DocPage, type TocEntry } from "./routes.generated";
import { mdxComponents } from "./mdx/provider";
import { Navbar } from "./layout/Navbar";
import { Sidebar } from "./layout/Sidebar";
import { Toc } from "./layout/Toc";
import { PageHeader, Pagination, SiteFooter } from "./layout/PageChrome";
import { SearchDialog } from "./search/SearchDialog";
import { MobileDrawer } from "./layout/MobileDrawer";

/** Module cache so a page renders synchronously on repeat visits and during prerender. */
const loaded = new Map<string, { Component: ComponentType<any>; toc: TocEntry[] }>();

export function preload(route: string) {
  const page = byRoute.get(route);
  if (!page || loaded.has(route)) return Promise.resolve();
  return page.load().then((m) => {
    loaded.set(route, { Component: m.default, toc: m.tableOfContents ?? [] });
  });
}

function DocRoute({ page }: { page: DocPage }) {
  const entry = loaded.get(page.route);
  const [, force] = useState(0);

  useEffect(() => {
    if (!entry) preload(page.route).then(() => force((n) => n + 1));
  }, [entry, page.route]);

  const index = pages.findIndex((p) => p.route === page.route);
  const prev = index > 0 ? pages[index - 1] : undefined;
  const next = index < pages.length - 1 ? pages[index + 1] : undefined;

  const Body = entry?.Component;
  const toc = entry?.toc ?? [];

  return (
    <div className="flex flex-row-reverse gap-12 box-border w-full pt-40 lg:pt-10">
      <Toc toc={toc} />
      <div
        id="content-area"
        className="relative grow box-border flex-col w-full mx-auto px-1 lg:pl-[5.7rem] lg:-ml-12 xl:w-[calc(100%-28rem)]"
      >
        <PageHeader page={page} />
        <div
          id="content"
          className="mdx-content @container/columns-container relative mt-8 prose prose-gray dark:prose-invert [contain:inline-size] isolate empty:hidden mb-14"
          data-page-title={page.title}
          data-page-href={page.route}
        >
          {Body ? <Body /> : null}
        </div>
        <Pagination prev={prev} next={next} />
        <SiteFooter />
      </div>
    </div>
  );
}

export default function App() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = useMemo(
    () => byRoute.get(pathname) ?? byRoute.get(pathname.replace(/\/$/, "")) ?? pages[0],
    [pathname]
  );

  // Ctrl/Cmd-K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close the drawer and restore scroll on navigation
  useEffect(() => {
    setDrawerOpen(false);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  // resolve the hash once content has mounted
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
        return;
      }
      if (tries++ < 40) requestAnimationFrame(tick);
    };
    tick();
  }, [hash, pathname]);

  return (
    <MDXProvider components={mdxComponents}>
      <div className="mint-root relative antialiased text-gray-500 dark:text-gray-400">
        <span
          id="background-color"
          className="fixed inset-0 bg-background-light dark:bg-background-dark -z-10 pointer-events-none"
        />
        <Navbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenDrawer={() => setDrawerOpen(true)}
          group={current.group}
          title={current.title}
        />
        <div className="max-w-8xl mx-auto px-4 lg:px-8">
          <div className="flex">
            <Sidebar />
            <main id="content-container" className="flex-1 min-w-0">
              <Suspense fallback={null}>
                <Routes>
                  {pages.map((p) => (
                    <Route key={p.route} path={p.route} element={<DocRoute page={p} />} />
                  ))}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <SearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onNavigate={(r) => {
            setSearchOpen(false);
            navigate(r);
          }}
        />
      </div>
    </MDXProvider>
  );
}

function NotFound() {
  return (
    <div className="flex flex-row-reverse gap-12 w-full pt-40 lg:pt-10">
      <div
        id="content-area"
        className="relative grow box-border w-full mx-auto px-1 lg:pl-[5.7rem] lg:-ml-12 xl:w-[calc(100%-28rem)]"
      >
        <header id="header" className="relative leading-none">
          <div className="mt-0.5 space-y-2.5">
            <div className="eyebrow h-5 text-primary dark:text-primary-light text-sm font-semibold">
              Error
            </div>
            <h1
              id="page-title"
              className="text-3xl sm:text-4xl text-gray-900 tracking-tight dark:text-gray-200 font-semibold"
            >
              Page not found
            </h1>
          </div>
        </header>
        <div className="mdx-content prose prose-gray dark:prose-invert mt-8 mb-14">
          <p>
            That page doesn&rsquo;t exist. Try the <a href="/">introduction</a>.
          </p>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
