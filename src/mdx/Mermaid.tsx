import { useEffect, useRef, useState } from "react";
import { PlusIcon, MinusIcon, ResetIcon, FullscreenIcon } from "../lib/icons";

/**
 * Mermaid diagrams (4 in this content: 2 gitGraph, 2 flowchart).
 *
 * Config is deliberately minimal: the live site uses mermaid's STOCK `dark` theme with no
 * themeVariables. Injecting TuringDB-green branch colours would actively diverge from the
 * reference — measured gitGraph branches are #797D7D / #A12273 / #6A8993, i.e. mermaid's
 * own dark palette. flowchart.htmlLabels must stay on because two labels contain <b> and
 * <br/>; theme.css keeps that <b> at body weight, as upstream does.
 *
 * Renders client-side only; SSR emits a sized placeholder so prerendered HTML doesn't shift.
 */
let idCounter = 0;

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        flowchart: { htmlLabels: true },
      });
      try {
        const { svg: out } = await mermaid.render(`mermaid-${++idCounter}`, chart);
        if (!cancelled) setSvg(out);
      } catch (err) {
        if (!cancelled) setSvg(`<pre class="text-sm text-gray-400">${String(err)}</pre>`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      className="group/mermaid relative overflow-hidden w-full not-prose my-4"
      data-component-name="mermaid-container"
      ref={ref}
    >
      <div
        data-component-name="mermaid-controls-wrapper"
        className="absolute z-10 grid grid-cols-3 gap-1 print:hidden opacity-0 pointer-events-none transition-opacity group-hover/mermaid:opacity-100 group-hover/mermaid:pointer-events-auto bottom-2 right-2"
      >
        <Ctl label="Zoom in" onClick={() => setZoom((z) => Math.min(z * 1.2, 4))}>
          <PlusIcon className="size-4 shrink-0" />
        </Ctl>
        <Ctl label="Zoom out" onClick={() => setZoom((z) => Math.max(z / 1.2, 0.4))}>
          <MinusIcon className="size-4 shrink-0" />
        </Ctl>
        <Ctl label="Reset" onClick={() => setZoom(1)}>
          <ResetIcon className="size-4 shrink-0" />
        </Ctl>
        <Ctl
          label="Open fullscreen"
          onClick={() => ref.current?.requestFullscreen?.().catch(() => {})}
        >
          <FullscreenIcon className="size-4 shrink-0" />
        </Ctl>
      </div>
      <div
        style={{ transform: zoom === 1 ? undefined : `scale(${zoom})`, transformOrigin: "center" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

function Ctl({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex items-center justify-center size-7 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 transition-[transform] duration-100 active:scale-95"
    >
      {children}
    </button>
  );
}
