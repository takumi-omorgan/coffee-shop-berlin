import { describe, expect, it } from "vitest";
import { shopsToPins } from "@/lib/map";
import type { CoffeeShop } from "@/lib/types";

function makeShop(overrides: Partial<CoffeeShop> = {}): CoffeeShop {
  return {
    id: "1",
    name: "Test Café",
    slug: "test-cafe",
    status: "active",
    address_full: "Test St 1",
    postal_code: "10100",
    neighborhood_slug: "mitte",
    latitude: 52.52,
    longitude: 13.405,
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

describe("shopsToPins", () => {
  it("maps shop fields to pin fields correctly", () => {
    const shops = [
      makeShop({
        slug: "bonanza",
        name: "Bonanza",
        latitude: 52.51,
        longitude: 13.42,
      }),
    ];
    const pins = shopsToPins(shops);
    expect(pins).toHaveLength(1);
    expect(pins[0]).toEqual({
      slug: "bonanza",
      name: "Bonanza",
      lat: 52.51,
      lon: 13.42,
    });
  });

  it("excludes shops with null latitude", () => {
    const shops = [
      makeShop({ slug: "good", latitude: 52.5, longitude: 13.4 }),
      makeShop({ slug: "bad", latitude: null as unknown as number }),
    ];
    const pins = shopsToPins(shops);
    expect(pins.map((p) => p.slug)).toEqual(["good"]);
  });

  it("excludes shops with undefined longitude", () => {
    const shops = [
      makeShop({
        slug: "bad",
        longitude: undefined as unknown as number,
      }),
    ];
    expect(shopsToPins(shops)).toEqual([]);
  });

  it("excludes shops with NaN latitude", () => {
    const shops = [
      makeShop({ slug: "bad", latitude: Number.NaN as unknown as number }),
    ];
    expect(shopsToPins(shops)).toEqual([]);
  });

  it("excludes shops with NaN longitude", () => {
    const shops = [
      makeShop({ slug: "bad", longitude: Number.NaN as unknown as number }),
    ];
    expect(shopsToPins(shops)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(shopsToPins([])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const shops = [
      makeShop({ slug: "a", latitude: 52.5, longitude: 13.4 }),
      makeShop({ slug: "b", latitude: 52.6, longitude: 13.5 }),
    ];
    const snapshot = shops.map((s) => ({ ...s }));
    shopsToPins(shops);
    expect(shops).toEqual(snapshot);
    expect(shops).toHaveLength(2);
  });

  it("returns new array objects (no aliasing of input)", () => {
    const shops = [makeShop({ slug: "a", latitude: 52.5, longitude: 13.4 })];
    const pins = shopsToPins(shops);
    expect(pins).not.toBe(shops);
    expect(pins[0]).not.toBe(shops[0]);
  });
});
