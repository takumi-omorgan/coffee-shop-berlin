import { describe, expect, it } from "vitest";
import type { CoffeeShop } from "../../src/lib/types";
import { ogTitle } from "../../src/lib/og";

describe("ogTitle", () => {
  it("returns a short name unchanged", () => {
    const shop = { name: "Bonanza Coffee Heroes" } as CoffeeShop;
    expect(ogTitle(shop)).toBe("Bonanza Coffee Heroes");
    expect(ogTitle(shop).length).toBeLessThanOrEqual(60);
  });

  it("truncates a long name to at most 60 characters ending in an ellipsis", () => {
    const name =
      "A Coffee Shop With A Really Really Really Really Really Really Long Name";
    expect(name.length).toBeGreaterThan(60);
    const result = ogTitle({ name } as CoffeeShop);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith("\u2026")).toBe(true);
  });

  it("truncates on a word boundary when position 59 falls mid-word", () => {
    // "Bonanza Coffee Heroes Specialty Roastery Cafe" is 45 chars; the space
    // after it sits at index 45. The trailing word
    // "EspressoBarPremiumQualityRoastedBeans" (37 chars) starts at index 46, so
    // position 59 lands mid-word. The last space at or before index 59 is the
    // one at index 45, so the cut keeps the full prior word and appends "…".
    const name =
      "Bonanza Coffee Heroes Specialty Roastery Cafe EspressoBarPremiumQualityRoastedBeans";
    expect(name.length).toBeGreaterThan(60);
    expect(ogTitle({ name } as CoffeeShop)).toBe(
      "Bonanza Coffee Heroes Specialty Roastery Cafe\u2026",
    );
  });

  it("hard-cuts a single-word name longer than 60 to 59 + ellipsis (length 60)", () => {
    const name = "A".repeat(70);
    expect(name.length).toBeGreaterThan(60);
    const result = ogTitle({ name } as CoffeeShop);
    expect(result).toBe("A".repeat(59) + "\u2026");
    expect(result.length).toBe(60);
  });
});
