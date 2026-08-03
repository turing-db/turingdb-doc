// Inline SVGs matching Mintlify's 18x18 / stroke-1.5 icon set, plus the four brand marks
// (which upstream loads as CSS masks from a CloudFront FontAwesome build — inlined here so
// the app has no external runtime dependency).
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const stroke = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 18,
  height: 18,
  viewBox: "0 0 18 18",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MagnifierIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <circle cx="7.75" cy="7.75" r="5" />
    <path d="M11.5 11.5L15.25 15.25" />
  </svg>
);

/** "On this page": three bars, the last one short. No bullets. stroke-width 2. */
export const ListIcon = (p: P) => (
  <svg {...stroke} strokeWidth={2} {...p}>
    <path d="M2.75 14.25H15.25" />
    <path d="M2.75 3.75H15.25" />
    <path d="M2.75 9H8.25" />
  </svg>
);

/** Pagination chevron: 3x6 viewBox, 2-unit stroke, overflow-visible — reads as a bold mark
    despite the 6px box. */
export const PagChevronIcon = (p: P) => (
  <svg viewBox="0 0 3 6" aria-hidden="true" {...p}>
    <path d="M3 0L0 3L3 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M6.5 3.5L12 9l-5.5 5.5" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M3.5 6.5L9 12l5.5-5.5" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M2.5 4.75h13M2.5 9h13M2.5 13.25h13" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M4 4l10 10M14 4L4 14" />
  </svg>
);

/** Copy: exact reference geometry (the earlier hand-drawn version read ~2px small). */
export const CopyIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" />
    <path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M3.5 9.5l3.5 3.5 7.5-8" />
  </svg>
);

export const LinkIcon = (p: P) => (
  <svg {...stroke} strokeWidth={2} {...p}>
    <path d="M8.5 6.827A3.6 3.6 0 007.527 7.517l-.01.01a3.543 3.543 0 000 5.01l2.175 2.175a3.543 3.543 0 005.01 0l.01-.01a3.543 3.543 0 000-5.01l-.931-.931" />
    <path d="M9.5 11.173a3.6 3.6 0 00.973-.69l.01-.01a3.543 3.543 0 000-5.01L8.308 3.298a3.543 3.543 0 00-5.01 0l-.01.01a3.543 3.543 0 000 5.01l.931.931" />
  </svg>
);

/* ---------- callout icons ---------- */

/** Tip. The cutout subpaths are what make it read as an outlined bulb rather than a solid one. */
export const LightbulbIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path
      d="M 4.0216 15.9727 C 4.0216 16.1941 4.0855 16.4101 4.2074 16.5947 L 4.81 17.4979 C 4.9946 17.7747 5.4137 18 5.7467 18 H 7.9149 C 8.2468 18 8.6659 17.775 8.8505 17.4979 L 9.451 16.5951 C 9.5543 16.439 9.6391 16.1601 9.6391 15.9727 L 9.6436 14.5945 H 4.0181 L 4.0216 15.9727 Z M 6.8308 0 C 3.2453 0.0113 0.6429 2.9171 0.6429 6.1563 C 0.6429 7.7167 1.2209 9.1392 2.1744 10.2278 C 2.7556 10.8901 3.663 12.2751 4.0104 13.443 C 4.0115 13.4518 4.0137 13.4612 4.0148 13.4706 H 9.6473 C 9.6483 13.4612 9.6505 13.4524 9.6517 13.443 C 9.9988 12.2751 10.9065 10.8901 11.4877 10.2278 C 12.4422 9.1695 13.0189 7.749 13.0189 6.1563 C 13.0189 2.7705 10.2483 0.0001 6.8308 0 Z M 10.2202 9.1449 C 9.6696 9.7724 8.9882 10.7727 8.4956 11.8131 H 5.1692 C 4.6766 10.7727 3.9953 9.7724 3.445 9.1452 C 2.7257 8.3257 2.3305 7.2463 2.3305 6.1563 C 2.3305 3.9835 4.0216 1.6964 6.7992 1.6876 C 9.3131 1.6876 11.3312 3.7058 11.3312 6.1563 C 11.3312 7.2463 10.9374 8.3257 10.2202 9.1449 Z M 6.2683 2.8127 C 4.7178 2.8127 3.4556 4.0749 3.4556 5.6254 C 3.4556 5.9364 3.7072 6.188 4.0181 6.188 C 4.3291 6.188 4.5807 5.9348 4.5807 5.6254 C 4.5807 4.6948 5.3376 3.9378 6.2683 3.9378 C 6.5792 3.9378 6.8308 3.6865 6.8308 3.3756 C 6.8308 3.0647 6.5777 2.8127 6.2683 2.8127 Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

/** Info: lowercase i in a circle (filled outline form). */
export const InfoIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path
      d="M 7.2 0 C 3.2231 0 0 3.2231 0 7.2 C 0 11.1768 3.2231 14.4 7.2 14.4 C 11.1768 14.4 14.4 11.1768 14.4 7.2 C 14.4 3.2231 11.1768 0 7.2 0 Z M 7.2 13.05 C 3.9741 13.05 1.35 10.4257 1.35 7.2 C 1.35 3.9743 3.9741 1.35 7.2 1.35 C 10.426 1.35 13.05 3.9743 13.05 7.2 C 13.05 10.4257 10.426 13.05 7.2 13.05 Z M 8.325 9.45 H 7.875 V 6.975 C 7.875 6.6038 7.5741 6.3 7.2 6.3 H 6.3 C 5.9288 6.3 5.625 6.6038 5.625 6.975 C 5.625 7.3462 5.9288 7.65 6.3 7.65 H 6.525 V 9.45 H 6.075 C 5.7038 9.45 5.4 9.7538 5.4 10.125 C 5.4 10.4962 5.7038 10.8 6.075 10.8 H 8.325 C 8.6977 10.8 9 10.4977 9 10.125 C 9 9.7523 8.6991 9.45 8.325 9.45 Z M 7.2 5.4 C 7.6971 5.4 8.1 4.9971 8.1 4.5 C 8.1 4.0029 7.6971 3.6 7.2 3.6 C 6.7029 3.6 6.3 4.0029 6.3 4.5 C 6.3 4.9971 6.7029 5.4 7.2 5.4 Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

/** Check: a bare filled checkmark — no surrounding circle. */
export const CheckCircleIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path
      d="M 15.4195 3.7055 C 15.859 4.1449 15.859 4.8551 15.4195 5.2945 L 6.4195 14.2945 C 5.9801 14.734 5.2699 14.734 4.8305 14.2945 L 0.3295 9.7945 C -0.1098 9.3551 -0.1098 8.6449 0.3295 8.2055 C 0.7689 7.766 1.4811 7.766 1.9206 8.2055 L 5.5934 11.9074 L 13.8305 3.7055 C 14.2699 3.2653 14.9801 3.2653 15.4195 3.7055 H 15.4195 z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const WarningIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M 9 6.75 v 1.5 m 0 3 h 0.0075 m -5.2035 3 h 10.392 c 1.155 0 1.8765 -1.2503 1.299 -2.25 L 10.299 3 c -0.5775 -0.9997 -2.0205 -0.9997 -2.598 0 L 2.505 12 c -0.5775 0.9997 0.144 2.25 1.299 2.25 z" />
  </svg>
);

/** Note: an EXCLAMATION in a circle (bar above, block below) — not a lowercase i. */
export const NoteIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path
      d="M 9 1.6714 C 13.0371 1.6714 16.3286 4.9629 16.3286 9 C 16.3286 13.0371 13.0371 16.3286 9 16.3286 C 7.0574 16.3252 5.1953 15.552 3.8217 14.1783 C 2.448 12.8047 1.6748 10.9426 1.6714 9 C 1.6714 4.9629 4.9629 1.6714 9 1.6714 Z M 9 0 C 4.0371 0 0 4.0371 0 9 C 0 13.9629 4.0371 18 9 18 C 13.9629 18 18 13.9629 18 9 C 18 4.0371 13.9629 0 9 0 Z M 10.2857 3.8571 H 7.7143 V 10.2857 H 10.2857 V 3.8571 Z M 10.2857 11.5714 H 7.7143 V 14.1429 H 10.2857 V 11.5714 Z"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

/* ---------- mermaid controls ---------- */

export const PlusIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M9 3.75v10.5M3.75 9h10.5" />
  </svg>
);
export const MinusIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M3.75 9h10.5" />
  </svg>
);
export const ResetIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M15.25 9a6.25 6.25 0 11-1.83-4.42" />
    <path d="M14.5 2.25v3h-3" />
  </svg>
);
export const FullscreenIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M10.75 2.75h4.5v4.5M7.25 15.25h-4.5v-4.5" />
  </svg>
);

/* ---------- brand marks (footer) ---------- */

const brand = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

export const GithubIcon = (p: P) => (
  <svg {...brand} {...p}>
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.88.12 3.18.78.84 1.24 1.91 1.24 3.23 0 4.63-2.8 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
  </svg>
);

export const LinkedinIcon = (p: P) => (
  <svg {...brand} {...p}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export const YoutubeIcon = (p: P) => (
  <svg {...brand} {...p}>
    <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
  </svg>
);

export const DiscordIcon = (p: P) => (
  <svg {...brand} {...p}>
    <path d="M20.32 4.37A19.79 19.79 0 0015.43 2.9a.07.07 0 00-.08.04c-.21.38-.44.87-.6 1.25a18.27 18.27 0 00-5.5 0 12.6 12.6 0 00-.61-1.25.08.08 0 00-.08-.04A19.74 19.74 0 003.68 4.37a.07.07 0 00-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.05 19.9 19.9 0 006 3.03.07.07 0 00.08-.03c.46-.63.87-1.29 1.23-1.99a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.89.08.08 0 01-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 01.08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 01.08.01c.12.1.24.2.37.29a.08.08 0 01-.01.13c-.6.35-1.22.64-1.87.89a.08.08 0 00-.04.11c.36.7.78 1.36 1.23 1.99a.08.08 0 00.08.03 19.84 19.84 0 006-3.03.08.08 0 00.03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z" />
  </svg>
);

export const SOCIAL_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  discord: DiscordIcon,
};
