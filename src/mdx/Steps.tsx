import { Children, isValidElement, cloneElement, type ReactElement, type ReactNode } from "react";

/**
 * Steps / Step.
 *
 * Metrics: .steps is ml-3.5 mt-10 mb-6; each .step is relative flex items-start pb-5; the
 * connector is a 1px absolute line at top-11 with height calc(100% - 2.75rem); the number
 * badge is size-7 (28px) rounded-full on white/10, 12px text at weight 300 — NOT 600, the
 * global body-weight rule wins.
 *
 * The last step's connector is not omitted, it fades: bg-linear-to-b from-white/10
 * via-80% to-transparent.
 *
 * Step titles render as <p> (16px IBM Plex, gray-200) UNLESS titleSize="h2" is set, in
 * which case they become real <h2> headings (24px Ark Pixel) that also get an id and a TOC
 * entry. quickstart.mdx uses titleSize="h2"; the four import_data pages do not.
 */
export function Steps({
  children,
  titleSize,
}: {
  children?: ReactNode;
  titleSize?: string;
}) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<StepProps>[];
  return (
    <div role="list" className="steps ml-3.5 mt-10 mb-6">
      {items.map((child, i) =>
        cloneElement(child, {
          key: i,
          _index: i + 1,
          _last: i === items.length - 1,
          titleSize: child.props.titleSize ?? titleSize,
        })
      )}
    </div>
  );
}

type StepProps = {
  title?: string;
  titleSize?: string;
  id?: string;
  icon?: string;
  children?: ReactNode;
  _index?: number;
  _last?: boolean;
};

export function Step({ title, titleSize, id, children, _index = 1, _last = false }: StepProps) {
  const asHeading = titleSize === "h2";
  return (
    <div
      {...(asHeading && id ? { id } : {})}
      role="listitem"
      className="step group/step step-container relative flex items-start pb-5"
    >
      <div
        data-component-part="step-line"
        className={
          "absolute w-px h-[calc(100%-2.75rem)] top-11 " +
          (_last
            ? "bg-transparent bg-linear-to-b from-gray-200/70 dark:from-white/10 via-80% to-transparent"
            : "bg-gray-200/70 dark:bg-white/10")
        }
      />
      <div className="absolute ml-[-13px] py-2" data-component-part="step-number">
        <div className="group/step-indicator relative size-7 shrink-0 rounded-full bg-gray-50 dark:bg-white/10 text-xs text-gray-900 dark:text-gray-50 font-semibold flex items-center justify-center">
          <div>{_index}</div>
        </div>
      </div>
      <div className="w-full overflow-hidden pl-8 pr-px">
        {title &&
          (asHeading ? (
            <h2 className="mt-2 cursor-pointer" data-component-part="step-title">
              {title}
            </h2>
          ) : (
            <p
              className="mt-2 font-semibold prose dark:prose-invert text-gray-900 dark:text-gray-200"
              data-component-part="step-title"
            >
              {title}
            </p>
          ))}
        <div data-component-part="step-content" className="prose dark:prose-invert">
          {children}
        </div>
      </div>
    </div>
  );
}
