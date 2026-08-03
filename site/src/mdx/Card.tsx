import { useId, type ReactNode } from "react";
import { Link } from "react-router";

/**
 * CardGroup / Card.
 *
 * The grid is container-query driven upstream (@container/columns-container on .mdx-content),
 * with a `--cols` custom property from the cols prop. The repo's style.css then forces
 * gap: 0 and border-radius: 0, so the cards butt together into one slab with a single 1px
 * seam — that is intentional, not a bug.
 *
 * Two Card shapes exist in this content: the vertical linked card with an image, icon,
 * title and body (index.mdx), and a horizontal variant with no title used on
 * query/cypher_subset.mdx.
 */
export function CardGroup({ cols = 2, children }: { cols?: number; children?: ReactNode }) {
  return (
    <div
      className="columns prose dark:prose-invert grid max-w-none gap-4 card-group dark:prose-dark gap-y-0 grid-cols-1 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
      style={{ ["--cols" as string]: String(cols) }}
    >
      {children}
    </div>
  );
}

export function Card({
  title,
  icon,
  img,
  href,
  horizontal = false,
  children,
}: {
  title?: string;
  icon?: string;
  img?: string;
  href?: string;
  horizontal?: boolean;
  children?: ReactNode;
}) {
  const titleId = useId();
  const linked = Boolean(href);

  const body = (
    <>
      {icon && (
        <div
          aria-hidden="true"
          className="size-6 fill-gray-800 dark:fill-gray-100 text-gray-800 dark:text-gray-100 [&>svg]:size-6"
          data-component-part="card-icon"
        >
          <img
            alt=""
            aria-hidden="true"
            className="size-6 m-0! shrink-0 bg-transparent dark:bg-transparent"
            src={icon}
          />
        </div>
      )}
      <div className="w-full">
        {title && (
          <h2
            id={titleId}
            className="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4"
            data-component-part="card-title"
          >
            {title}
          </h2>
        )}
        <div
          className={
            "prose font-normal text-base leading-6 text-gray-600 dark:text-gray-400 " +
            (title ? "mt-1" : "mt-0")
          }
          data-component-part="card-content"
        >
          {children}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={
        "card block font-normal group relative my-2 ring-2 ring-transparent rounded-2xl bg-white dark:bg-background-dark border border-gray-950/10 dark:border-white/10 overflow-hidden w-full " +
        (linked ? "cursor-pointer hover:border-primary! dark:hover:border-primary-light!" : "")
      }
      {...(linked ? { role: "link", tabIndex: 0, "aria-labelledby": titleId } : {})}
    >
      {img && (
        <img
          alt={title ?? ""}
          className="w-full object-cover object-center not-prose"
          data-component-part="card-image"
          src={img}
        />
      )}
      <div
        className={
          "px-6 py-5 relative " + (horizontal ? "flex items-center gap-x-4" : "")
        }
        data-component-part="card-content-container"
      >
        {linked ? (
          <Link
            to={href!}
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "contents", color: "inherit", textDecoration: "none" }}
          >
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
    </div>
  );
}
