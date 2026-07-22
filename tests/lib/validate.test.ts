import { describe, expect, it } from "vitest";
import { parseNeighborhoods, parseShop, parseShops } from "../../src/lib/validate";
import shopsFixture from "../fixtures/shops.fixture.json";
import neighborhoodsFixture from "../fixtures/neighborhoods.fixture.json";

describe("parseShop", () => {
  it("accepts the full shops fixture via parseShops (>= 12 shops)", () => {
    const shops = parseShops(shopsFixture);
    expect(shops.length).toBeGreaterThanOrEqual(12);
  });

  it("rejects a wrong enum value, naming the field in the message", () => {
    const bad = { ...(shopsFixture as unknown[])[0] } as Record<string, unknown>;
    bad.status = "open";
    expect(() => parseShop(bad)).toThrow(/status/);
  });

  it("rejects a missing required field, naming the field in the message", () => {
    const bad = { ...(shopsFixture as unknown[])[0] } as Record<string, unknown>;
    delete bad.name;
    expect(() => parseShop(bad)).toThrow(/name/);
  });

  it("accepts a shop with all nullable P2 fields set to null", () => {
    const base = (shopsFixture as unknown[])[0] as Record<string, unknown>;
    const nullified: Record<string, unknown> = { ...base };
    for (const key of [
      "postal_code",
      "website_url",
      "instagram_url",
      "phone",
      "google_maps_url",
      "hours",
      "price_band",
      "wifi_available",
      "power_outlets",
      "noise_level",
      "laptop_friendly",
      "outdoor_seating",
      "editor_note",
      "primary_photo_url",
      "last_verified_at",
    ]) {
      nullified[key] = null;
    }
    expect(() => parseShop(nullified)).not.toThrow();
  });
});

describe("parseShops", () => {
  it("includes the failing array index in the error message", () => {
    const list = [...(shopsFixture as unknown[])];
    const bad = { ...(list[0] as Record<string, unknown>) } as Record<string, unknown>;
    bad.venue_type = "restaurant";
    // place the bad entry at a known index
    const index = 3;
    list[index] = bad;
    expect(() => parseShops(list)).toThrow(new RegExp(`shops\\[${index}\\]`));
  });
});

describe("parseNeighborhoods", () => {
  it("parses the neighborhoods fixture", () => {
    const result = parseNeighborhoods(neighborhoodsFixture);
    expect(result).toHaveLength(4);
    for (const n of result) {
      expect(n.slug.length).toBeGreaterThan(0);
      expect(n.name.length).toBeGreaterThan(0);
      expect(n.intro.length).toBeGreaterThan(0);
    }
  });
});
