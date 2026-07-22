import type { CoffeeShop } from "./types";

const TRAILING_PUNCTUATION =
  /[\s.,;:!?()[\]{}"'\/\\&@#*+=<>|_~`^%\-\u2013\u2014\u2018\u2019\u201C\u201D]+$/;

/**
 * Build a display title for an OG image. Names of 60 characters or fewer are
 * returned unchanged. Longer names are truncated to at most 60 characters
 * (including a trailing ellipsis "…"), cutting on the last word boundary at
 * or before position 59 and trimming trailing punctuation/spaces. A name with
 * no space before the limit is hard-cut to 59 characters + "…".
 */
export function ogTitle(shop: CoffeeShop): string {
  const name = shop.name;
  if (name.length <= 60) return name;

  const spaceIndex = name.lastIndexOf(" ", 59);
  let head: string;
  if (spaceIndex === -1) {
    head = name.slice(0, 59);
  } else {
    head = name.slice(0, spaceIndex).replace(TRAILING_PUNCTUATION, "");
    if (head.length === 0) head = name.slice(0, 59);
  }
  return head + "\u2026";
}
