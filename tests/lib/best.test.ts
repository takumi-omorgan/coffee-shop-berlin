import { describe, expect, it } from "vitest";
import type { CoffeeShop, Neighborhood } from "../../src/lib/types";
import {
  BEST_ATTRIBUTES,
  qualifyingAttributePages,
  qualifyingComboPages,
} from "../../src/lib/best";

function baseShop(overrides: Partial<CoffeeShop> = {}): CoffeeShop {
  return {
    id: "shop_00",
    name: "Café",
    slug: "cafe",
    status: "active",
    address_full: "X",
    postal_code: "10000",
    neighborhood_slug: "hood-five",
    latitude: 52.5,
    longitude: 13.4,
    website_url: null,
    instagram_url: null,
    phone: null,
    google_maps_url: null,
    hours: null,
    specialty_coffee: true,
    venue_type: "cafe",
    coffee_methods: ["espresso"],
    price_band: null,
    wifi_available: false,
    power_outlets: null,
    noise_level: null,
    laptop_friendly: "no",
    outdoor_seating: false,
    vibe_tags: [],
    editor_note: null,
    primary_photo_url: null,
    last_verified_at: null,
    ...overrides,
  };
}

const hood4: Neighborhood = {
  slug: "hood-four",
  name: "Hood Four",
  intro: "Four.",
};
const hood5: Neighborhood = {
  slug: "hood-five",
  name: "Hood Five",
  intro: "Five.",
};
const hoods: Neighborhood[] = [hood4, hood5];

function wifiShop(slug: string, neighborhood: string): CoffeeShop {
  return baseShop({
    id: slug,
    slug,
    name: slug,
    neighborhood_slug: neighborhood,
    wifi_available: true,
    outdoor_seating: false,
  });
}

function wifiOutdoorShop(slug: string, neighborhood: string): CoffeeShop {
  return baseShop({
    id: slug,
    slug,
    name: slug,
    neighborhood_slug: neighborhood,
    wifi_available: true,
    outdoor_seating: true,
  });
}

const shops: CoffeeShop[] = [
  // hood-four: 4 active wifi + 1 temporarily_closed wifi (must NOT count)
  wifiShop("h4-a", "hood-four"),
  wifiShop("h4-b", "hood-four"),
  wifiShop("h4-c", "hood-four"),
  wifiShop("h4-d", "hood-four"),
  { ...wifiShop("h4-closed", "hood-four"), status: "temporarily_closed" },
  // hood-five: 5 active wifi+outdoor shops
  wifiOutdoorShop("h5-a", "hood-five"),
  wifiOutdoorShop("h5-b", "hood-five"),
  wifiOutdoorShop("h5-c", "hood-five"),
  wifiOutdoorShop("h5-d", "hood-five"),
  wifiOutdoorShop("h5-e", "hood-five"),
];

describe("qualifyingComboPages", () => {
  it("excludes a combo with only 4 matching active shops", () => {
    const combos = qualifyingComboPages(shops, hoods);
    const hood4Combos = combos.filter(
      (c) => c.neighborhood.slug === hood4.slug,
    );
    expect(hood4Combos.length).toBe(0);
  });

  it("includes a combo with exactly 5 matching active shops", () => {
    const combos = qualifyingComboPages(shops, hoods);
    const hood5Combos = combos.filter(
      (c) => c.neighborhood.slug === hood5.slug,
    );
    expect(hood5Combos.length).toBeGreaterThanOrEqual(1);
    const wifiHood5 = hood5Combos.find(
      (c) => c.attribute.slug === "wifi",
    );
    expect(wifiHood5).toBeDefined();
    expect(wifiHood5!.shops).toHaveLength(5);
    expect(
      wifiHood5!.shops.every((s) => s.status === "active"),
    ).toBe(true);
  });

  it("does not count a temporarily_closed shop toward the threshold", () => {
    // h4 has 5 wifi shops total but one is temporarily_closed → 4 active.
    const combos = qualifyingComboPages(shops, hoods);
    const wifiHood4 = combos.find(
      (c) =>
        c.attribute.slug === "wifi" &&
        c.neighborhood.slug === hood4.slug,
    );
    expect(wifiHood4).toBeUndefined();
  });

  it("returns pairwise-distinct combo intros across >= 2 qualifying combos", () => {
    const combos = qualifyingComboPages(shops, hoods);
    expect(combos.length).toBeGreaterThanOrEqual(2);
    const intros = combos.map((c) => c.intro);
    const set = new Set(intros);
    expect(set.size).toBe(intros.length);
  });
});

describe("qualifyingAttributePages", () => {
  it("applies the >=5 threshold city-wide", () => {
    const pages = qualifyingAttributePages(shops);
    const slugs = pages.map((p) => p.attribute.slug);
    expect(slugs).toContain("wifi");
    expect(slugs).toContain("outdoor-seating");
    expect(slugs).not.toContain("laptop-friendly");
    expect(slugs).not.toContain("quiet");
    expect(slugs).not.toContain("filter-coffee");
  });
});

describe("BEST_ATTRIBUTES metadata", () => {
  it("every entry has non-empty slug/title/intro", () => {
    for (const attr of BEST_ATTRIBUTES) {
      expect(attr.slug.length).toBeGreaterThan(0);
      expect(attr.title.length).toBeGreaterThan(0);
      expect(attr.intro.length).toBeGreaterThan(0);
    }
  });

  it("laptop-friendly predicate matches laptop_friendly === 'yes'", () => {
    const attr = BEST_ATTRIBUTES.find((a) => a.slug === "laptop-friendly")!;
    expect(attr.predicate(baseShop({ laptop_friendly: "yes" }))).toBe(true);
    expect(attr.predicate(baseShop({ laptop_friendly: "mixed" }))).toBe(false);
    expect(attr.predicate(baseShop({ laptop_friendly: "no" }))).toBe(false);
    expect(attr.predicate(baseShop({ laptop_friendly: null }))).toBe(false);
  });

  it("filter-coffee predicate matches 'filter' OR 'pour_over'", () => {
    const attr = BEST_ATTRIBUTES.find((a) => a.slug === "filter-coffee")!;
    expect(attr.predicate(baseShop({ coffee_methods: ["filter"] }))).toBe(true);
    expect(
      attr.predicate(baseShop({ coffee_methods: ["pour_over"] })),
    ).toBe(true);
    expect(
      attr.predicate(
        baseShop({ coffee_methods: ["espresso", "pour_over"] }),
      ),
    ).toBe(true);
    expect(
      attr.predicate(baseShop({ coffee_methods: ["espresso"] })),
    ).toBe(false);
    expect(attr.predicate(baseShop({ coffee_methods: [] }))).toBe(false);
  });
});
