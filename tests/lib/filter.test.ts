import { describe, expect, it } from "vitest";
import { filterShops } from "../../src/lib/filter";
import type { CoffeeShop } from "../../src/lib/types";

function makeShop(overrides: Partial<CoffeeShop>): CoffeeShop {
  return {
    id: "s1",
    name: "Test Shop",
    slug: "test-shop",
    status: "active",
    address_full: "Test St. 1",
    postal_code: null,
    neighborhood_slug: "kreuzberg",
    latitude: 0,
    longitude: 0,
    website_url: null,
    instagram_url: null,
    phone: null,
    google_maps_url: null,
    hours: null,
    specialty_coffee: true,
    venue_type: "cafe",
    coffee_methods: [],
    price_band: null,
    wifi_available: null,
    power_outlets: null,
    noise_level: null,
    laptop_friendly: null,
    outdoor_seating: null,
    vibe_tags: [],
    editor_note: null,
    primary_photo_url: null,
    last_verified_at: null,
    ...overrides,
  };
}

describe("filterShops — single filter keys", () => {
  it("neighborhood keeps only matching slug", () => {
    const shops = [
      makeShop({ id: "a", neighborhood_slug: "kreuzberg" }),
      makeShop({ id: "b", neighborhood_slug: "neukoelln" }),
    ];
    const result = filterShops(shops, { neighborhood: "kreuzberg" });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("openAt keeps only shops open at the instant", () => {
    const mondayNoon = new Date(Date.UTC(2024, 6, 15, 10, 0));
    const shops = [
      makeShop({ id: "a", hours: { mon: [{ open: "00:00", close: "24:00" }] } }),
      makeShop({ id: "b", hours: { tue: [{ open: "08:00", close: "18:00" }] } }),
      makeShop({ id: "c", hours: null }),
    ];
    const result = filterShops(shops, { openAt: mondayNoon });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("laptopFriendly keeps only laptop_friendly === 'yes'", () => {
    const shops = [
      makeShop({ id: "a", laptop_friendly: "yes" }),
      makeShop({ id: "b", laptop_friendly: "mixed" }),
      makeShop({ id: "c", laptop_friendly: "no" }),
    ];
    const result = filterShops(shops, { laptopFriendly: true });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("wifi keeps only wifi_available === true", () => {
    const shops = [
      makeShop({ id: "a", wifi_available: true }),
      makeShop({ id: "b", wifi_available: false }),
      makeShop({ id: "c", wifi_available: null }),
    ];
    const result = filterShops(shops, { wifi: true });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("outdoor keeps only outdoor_seating === true", () => {
    const shops = [
      makeShop({ id: "a", outdoor_seating: true }),
      makeShop({ id: "b", outdoor_seating: false }),
      makeShop({ id: "c", outdoor_seating: null }),
    ];
    const result = filterShops(shops, { outdoor: true });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("vibe keeps only shops whose vibe_tags include the value", () => {
    const shops = [
      makeShop({ id: "a", vibe_tags: ["quiet", "cozy"] }),
      makeShop({ id: "b", vibe_tags: ["lively"] }),
    ];
    const result = filterShops(shops, { vibe: "quiet" });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("query keeps only shops whose name contains the query case-insensitively", () => {
    const shops = [
      makeShop({ id: "a", name: "Bonanza Coffee" }),
      makeShop({ id: "b", name: "Five Elephant" }),
    ];
    const result = filterShops(shops, { query: "BONANZA" });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });
});

describe("filterShops — combined AND semantics", () => {
  it("keeps only shops matching every provided filter", () => {
    const shops = [
      makeShop({
        id: "a",
        neighborhood_slug: "kreuzberg",
        wifi_available: true,
        vibe_tags: ["quiet"],
        name: "Bonanza Coffee",
      }),
      makeShop({
        id: "b",
        neighborhood_slug: "kreuzberg",
        wifi_available: true,
        vibe_tags: ["lively"],
        name: "Bonanza Roastery",
      }),
      makeShop({
        id: "c",
        neighborhood_slug: "neukoelln",
        wifi_available: true,
        vibe_tags: ["quiet"],
        name: "Bonanza North",
      }),
      makeShop({
        id: "d",
        neighborhood_slug: "kreuzberg",
        wifi_available: false,
        vibe_tags: ["quiet"],
        name: "Bonanza NoWifi",
      }),
    ];
    const result = filterShops(shops, {
      neighborhood: "kreuzberg",
      wifi: true,
      vibe: "quiet",
      query: "coffee",
    });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });
});

describe("filterShops — status exclusion", () => {
  it("excludes temporarily_closed shops even when they would otherwise match", () => {
    const shops = [
      makeShop({ id: "a", status: "active", neighborhood_slug: "kreuzberg" }),
      makeShop({ id: "b", status: "temporarily_closed", neighborhood_slug: "kreuzberg" }),
      makeShop({ id: "c", status: "closed", neighborhood_slug: "kreuzberg" }),
    ];
    const result = filterShops(shops, { neighborhood: "kreuzberg" });
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("does not mutate the input array", () => {
    const shops = [makeShop({ id: "a" }), makeShop({ id: "b", status: "closed" })];
    const snapshot = [...shops];
    const result = filterShops(shops, {});
    expect(result).not.toBe(shops);
    expect(shops).toEqual(snapshot);
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });
});
