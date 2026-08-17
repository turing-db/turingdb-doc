import { useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import rawIndex from "../search-index.generated.json";
import { MagnifierIcon } from "../lib/icons";

type Doc = {
  id: number;
  route: string;
  title: string;
  group: string;
  description: string;
  headings: string;
  text: string;
};

const docs = rawIndex as Doc[];

function buildIndex() {
  const mini = new MiniSearch<Doc>({
    fields: ["title", "headings", "description", "text"],
    storeFields: ["route", "title", "group", "description"],
    searchOptions: {
      boost: { title: 6, headings: 3, description: 2 },
      prefix: true,
      fuzzy: 0.15,
    },
  });
  mini.addAll(docs);
  return mini;
}

/** Replaces Mintlify's hosted search with a build-time index — no external service. */
export function SearchDialog({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mini = useMemo(() => (open ? buildIndex() : null), [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    if (!mini || !query.trim()) return [];
    return mini.search(query).slice(0, 12) as unknown as (Doc & { score: number })[];
  }, [mini, query]);

  useEffect(() => setSel(0), [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-200 dark:border-white/10 bg-background-light dark:bg-background-dark dark:brightness-[1.1] overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-200 dark:border-white/10">
          <MagnifierIcon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && results[sel]) {
                onNavigate(results[sel].route);
              }
            }}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-white/50"
          />
          <kbd className="text-xs text-gray-500 dark:text-gray-400">Esc</kbd>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto mint-scroll py-2">
          {query.trim() && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.route}>
              <button
                type="button"
                onMouseEnter={() => setSel(i)}
                onClick={() => onNavigate(r.route)}
                className={
                  "w-full text-left px-4 py-2.5 flex flex-col gap-0.5 " +
                  (i === sel ? "bg-primary/10 dark:bg-primary-light/10" : "")
                }
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span
                    className={
                      "text-sm truncate " +
                      (i === sel
                        ? "text-primary dark:text-primary-light"
                        : "text-gray-900 dark:text-gray-200")
                    }
                  >
                    {r.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 shrink-0">
                    {r.group}
                  </span>
                </span>
                {r.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {r.description}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
