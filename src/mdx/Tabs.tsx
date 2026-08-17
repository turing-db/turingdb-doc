import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { slugify } from "../lib/slugify";

/**
 * Tabs / Tab. Tablist is 48px tall: pt-3 pb-2.5 on the button plus a 1px bottom rule at
 * gray-200/10; the active button is primary-light with border-current, inactive is gray-200
 * with a transparent border that becomes gray-700 on hover.
 *
 * Note the tab panel resets the table bleed: tables inside a Tab get --page-padding: 0
 * rather than the 20px used at top level.
 */
export function Tabs({ children }: { children?: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<{
    title?: string;
    children?: ReactNode;
  }>[];
  const [active, setActive] = useState(0);
  if (!tabs.length) return null;

  return (
    <>
      <ul
        role="tablist"
        data-component-part="tabs-list"
        className="not-prose mb-6 pb-[1px] flex-none min-w-full overflow-auto border-b border-gray-200 gap-x-6 flex dark:border-gray-200/10 mint-scroll"
      >
        {tabs.map((t, i) => {
          const title = t.props.title ?? `Tab ${i + 1}`;
          const isActive = i === active;
          return (
            <li
              key={i}
              id={slugify(title)}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(i)}
              className="cursor-pointer"
            >
              <div
                data-component-part="tab-button"
                data-active={isActive}
                className={
                  "flex text-sm items-center gap-1.5 leading-6 font-semibold whitespace-nowrap pt-3 pb-2.5 -mb-px max-w-max border-b " +
                  (isActive
                    ? "text-primary dark:text-primary-light border-current"
                    : "text-gray-900 border-transparent hover:border-gray-300 dark:text-gray-200 dark:hover:border-gray-700")
                }
              >
                {title}
              </div>
            </li>
          );
        })}
      </ul>
      {tabs.map((t, i) => (
        <div
          key={i}
          role="tabpanel"
          hidden={i !== active}
          data-component-part="tab-content"
          className={
            (i === active ? "block " : "hidden ") +
            "prose dark:prose-invert overflow-x-auto [&_[data-table-wrapper]]:[--page-padding:0px] [&_[role=listitem]]:pl-4 [&>:first-child:not(p)]:mt-0"
          }
        >
          {t.props.children}
        </div>
      ))}
    </>
  );
}

export function Tab({ children }: { title?: string; children?: ReactNode }) {
  return <>{children}</>;
}
