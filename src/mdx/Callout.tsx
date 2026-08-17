import type { ReactNode } from "react";
import {
  LightbulbIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
  NoteIcon,
} from "../lib/icons";

/**
 * Callouts. Colours measured per type from the live site — note that Warning is the
 * YELLOW ramp (not amber) and Info is NEUTRAL (not blue); Tip and Check are colour-
 * identical and distinguished only by their glyph. Icon render sizes differ per type
 * (16 / 18 / 16 / 20 / 20 px) while the wrapper stays w-4, so tip and warning icons
 * deliberately overflow it.
 */
type Variant = "note" | "tip" | "check" | "warning" | "info";

const VARIANTS: Record<
  Variant,
  { label: string; box: string; text: string; icon: typeof InfoIcon; iconSize: string; nudge: boolean }
> = {
  note: {
    label: "Note",
    box: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-600/20",
    text: "text-blue-800 dark:text-blue-300",
    icon: NoteIcon,
    iconSize: "size-4",
    nudge: false,
  },
  tip: {
    label: "Tip",
    box: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-600/20",
    text: "text-green-800 dark:text-green-300",
    icon: LightbulbIcon,
    iconSize: "size-4.5",
    nudge: true,
  },
  check: {
    label: "Check",
    box: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-600/20",
    text: "text-green-800 dark:text-green-300",
    icon: CheckCircleIcon,
    iconSize: "size-4",
    nudge: false,
  },
  warning: {
    label: "Warning",
    box: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-600/20",
    text: "text-yellow-800 dark:text-yellow-300",
    icon: WarningIcon,
    iconSize: "flex-none size-5",
    nudge: true,
  },
  info: {
    label: "Info",
    box: "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-white/10",
    text: "text-neutral-800 dark:text-neutral-300",
    icon: InfoIcon,
    iconSize: "flex-none size-5",
    nudge: false,
  },
};

function Callout({ variant, children }: { variant: Variant; children?: ReactNode }) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <div
      role="note"
      aria-label={v.label}
      data-callout-type={variant}
      className={`callout my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border ${v.box}`}
    >
      <div
        className={`w-4 ${v.nudge ? "mt-px" : "mt-0.5"}`}
        data-component-part="callout-icon"
      >
        <Icon className={`${v.iconSize} ${v.text}`} />
      </div>
      <div
        data-component-part="callout-content"
        className={`text-sm prose dark:prose-invert min-w-0 w-full [&_code]:text-current! [&_a]:text-current! [&_a]:border-current [&_strong]:text-current! ${v.text}`}
      >
        {children}
      </div>
    </div>
  );
}

export const Note = (p: { children?: ReactNode }) => <Callout variant="note" {...p} />;
export const Tip = (p: { children?: ReactNode }) => <Callout variant="tip" {...p} />;
export const Check = (p: { children?: ReactNode }) => <Callout variant="check" {...p} />;
export const Warning = (p: { children?: ReactNode }) => <Callout variant="warning" {...p} />;
export const Info = (p: { children?: ReactNode }) => <Callout variant="info" {...p} />;
