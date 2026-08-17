import { Link } from "react-router";
import type { DocPage } from "../routes.generated";
import { footerSocials, SOCIAL_ORDER } from "../docs.config";
import { SOCIAL_ICONS, PagChevronIcon } from "../lib/icons";

/** Eyebrow + title + description. leading-none on the header is load-bearing. */
export function PageHeader({ page }: { page: DocPage }) {
  return (
    <header id="header" className="relative leading-none @container/page-header">
      <div className="mt-0.5 space-y-2.5">
        <div className="eyebrow h-5 text-primary dark:text-primary-light text-sm font-semibold">
          {page.group}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center relative gap-2 min-w-0">
          <h1
            id="page-title"
            className="text-3xl sm:text-4xl text-gray-900 tracking-tight dark:text-gray-200 [overflow-wrap:anywhere] font-semibold"
          >
            {page.title}
          </h1>
        </div>
      </div>
      {page.description && (
        <div className="mt-2 text-lg prose prose-gray dark:prose-invert [&>*]:[overflow-wrap:anywhere]">
          <p>{page.description}</p>
        </div>
      )}
    </header>
  );
}

/** Prev / next. Labels do NOT change colour on hover; only the chevrons do. */
export function Pagination({ prev, next }: { prev?: DocPage; next?: DocPage }) {
  return (
    <div
      id="pagination"
      className="px-0.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
    >
      {prev && (
        <Link to={prev.route} className="flex items-center space-x-3 group">
          <PagChevronIcon className="h-1.5 overflow-visible stroke-gray-400 group-hover:stroke-gray-600 dark:group-hover:stroke-gray-300" />
          <span>{prev.sidebarTitle}</span>
        </Link>
      )}
      {next && (
        <Link to={next.route} className="flex items-center ml-auto space-x-3 group">
          <span>{next.sidebarTitle}</span>
          <PagChevronIcon className="rotate-180 h-1.5 overflow-visible stroke-gray-400 group-hover:stroke-gray-600 dark:group-hover:stroke-gray-300" />
        </Link>
      )}
    </div>
  );
}

/**
 * Footer. Upstream renders the social marks as CSS masks pointing at a CloudFront
 * FontAwesome build and adds a "Powered by Mintlify" link; both are replaced here — inline
 * SVGs at the same 20x20 / gray-500 treatment, and no vendor attribution.
 */
export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="flex gap-12 justify-between pt-10 border-t border-gray-100 sm:flex dark:border-gray-800/50 pb-28"
    >
      <div className="flex gap-6 flex-wrap">
        {SOCIAL_ORDER.filter((k) => footerSocials[k]).map((k) => {
          const Icon = SOCIAL_ICONS[k];
          return (
            <a key={k} href={footerSocials[k]} target="_blank" rel="noreferrer" className="h-fit">
              <span className="sr-only">{k}</span>
              <Icon className="size-5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" />
            </a>
          );
        })}
      </div>
      <div className="flex items-center justify-between" />
    </footer>
  );
}
