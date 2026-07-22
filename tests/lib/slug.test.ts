import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "../../src/lib/slug";

describe("slugify", () => {
  it("transliterates umlauts (Müller Kaffee → mueller-kaffee)", () => {
    expect(slugify("Müller Kaffee")).toBe("mueller-kaffee");
  });

  it("transliterates ß (Straßencafé → strassencafe)", () => {
    expect(slugify("Straßencafé")).toBe("strassencafe");
  });

  it("strips accents via NFD (Café Kränzchen → cafe-kraenzchen)", () => {
    expect(slugify("Café Kränzchen")).toBe("cafe-kraenzchen");
  });

  it("collapses punctuation runs to a single dash and trims (The -- Barn! → the-barn)", () => {
    expect(slugify("The -- Barn!")).toBe("the-barn");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it is free", () => {
    expect(uniqueSlug("the-barn", new Set())).toBe("the-barn");
  });

  it("appends -2 on the first collision", () => {
    const taken = new Set(["the-barn"]);
    expect(uniqueSlug("the-barn", taken)).toBe("the-barn-2");
  });

  it("appends -3 on the second collision", () => {
    const taken = new Set(["the-barn", "the-barn-2"]);
    expect(uniqueSlug("the-barn", taken)).toBe("the-barn-3");
  });

  it("does not mutate the taken set", () => {
    const taken = new Set(["the-barn"]);
    uniqueSlug("the-barn", taken);
    expect(taken.size).toBe(1);
    expect(taken.has("the-barn-2")).toBe(false);
  });
});
