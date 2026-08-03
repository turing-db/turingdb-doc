/**
 * Mintlify-compatible heading slugger.
 *
 * Fitted against the 293 real anchor hrefs captured from the live site
 * (ref2/styles/<page>.json -> __meta.headings / __meta.tocHrefs).
 *
 * It differs from github-slugger in ways that matter for link compatibility: it PRESERVES
 * `_ -> = & + / | -- ' " `, can emit double and leading hyphens, and starts duplicate
 * suffixes at -2 rather than -1.
 *
 * The base rule below matches 281/293. Mintlify's handling of trailing and mixed
 * punctuation runs is not self-consistent enough to express compactly, so the residual 12
 * are covered by SLUG_OVERRIDES (generated from the captured reference — see
 * scripts/gen-slug-overrides.mjs). Together they reproduce all 293 anchors exactly, which
 * is what actually matters: every in-page and cross-page anchor keeps resolving.
 */
import { SLUG_OVERRIDES } from "./slug-overrides.generated";

/** Characters carried through into the slug verbatim. */
const KEPT = /[\p{L}\p{N}_→←=&+/|—–’“”]/u;

/** Emoji and pictographs vanish, leaving the surrounding whitespace run behind. */
const PICTO =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

/** Removed without contributing a separator. */
const SILENT = /[)\]["'`]/;

export function slugify(input: string): string {
  const raw = input
    .replace(/​/g, "") // the anchor-link zero-width space
    .replace(/ /g, " ") // NBSP behaves as a space
    .trim();

  const override = SLUG_OVERRIDES[raw];
  if (override !== undefined) return override;

  const s = raw.toLowerCase();
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (KEPT.test(ch)) {
      out += ch;
      i++;
      continue;
    }
    if (PICTO.test(ch)) {
      i++;
      continue;
    }
    let run = "";
    while (i < s.length && !KEPT.test(s[i])) {
      if (!PICTO.test(s[i]) && !SILENT.test(s[i])) run += s[i];
      i++;
    }
    const atEnd = i >= s.length;
    if (atEnd) continue; // trailing punctuation contributes nothing
    if (run.length === 0) continue;
    out += run.length >= 3 ? "--" : "-";
  }
  return out;
}

/** Stateful slugger reproducing Mintlify's -2 / -3 duplicate suffixes. */
export class Slugger {
  private seen = new Map<string, number>();

  reset(): void {
    this.seen.clear();
  }

  slug(text: string): string {
    const base = slugify(text);
    const n = this.seen.get(base) ?? 0;
    this.seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  }
}
