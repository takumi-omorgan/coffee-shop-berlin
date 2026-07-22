import { describe, expect, it } from "vitest";
import type { CoffeeShop } from "../../src/lib/types";
import {
  breadcrumbJsonLd,
  cafeJsonLd,
  itemListJsonLd,
} from "../../src/lib/jsonld";

function baseShop(overrides: Partial<CoffeeShop> = {}): CoffeeShop {
  return {
    id: "shop_01",
    name: "Bonanza Coffee Heroes",
    slug: "bonanza-coffee-heroes",
    status: "active",
    address_full: "Oderberger Str. 35, 10435 Berlin",
    postal_code: "10435",
    neighborhood_slug: "prenzlauer-berg",
    latitude: 52.5376,
    longitude: 13.4229,
    website_url: "https://bonanzacoffee.de",
    instagram_url: "https://instagram.com/bonanzacoffee",
    phone: "+49 30 9706 9007",
    google_maps_url: null,
    hours: null,
    specialty_coffee: true,
    venue_type: "roastery_cafe",
    coffee_methods: ["espresso", "pour_over"],
    price_band: "€€",
    wifi_available: true,
    power_outlets: "few",
    noise_level: "moderate",
    laptop_friendly: "yes",
    outdoor_seating: true,
    vibe_tags: ["third_wave"],
    editor_note: null,
    primary_photo_url: null,
    last_verified_at: null,
    ...overrides,
  };
}

describe("cafeJsonLd", () => {
  it("produces a CafeOrCoffeeShop with correct address and geo shapes", () => {
    const shop = baseShop();
    const ld = cafeJsonLd(shop);
    expect(ld["@type"]).toBe("CafeOrCoffeeShop");
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld.name).toBe("Bonanza Coffee Heroes");
    expect(ld.url).toBe(
      "https://coffee-shop-berlin.example/cafes/bonanza-coffee-heroes",
    );
    const address = ld.address as Record<string, unknown>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.streetAddress).toBe("Oderberger Str. 35, 10435 Berlin");
    expect(address.addressLocality).toBe("Berlin");
    expect(address.postalCode).toBe("10435");
    expect(address.addressCountry).toBe("DE");
    const geo = ld.geo as Record<string, unknown>;
    expect(geo["@type"]).toBe("GeoCoordinates");
    expect(geo.latitude).toBe(52.5376);
    expect(geo.longitude).toBe(13.4229);
  });

  it("omits openingHoursSpecification when hours is null", () => {
    const shop = baseShop({ hours: null });
    const ld = cafeJsonLd(shop);
    expect(ld).not.toHaveProperty("openingHoursSpecification");
  });

  it("includes openingHoursSpecification with opens/closes from the windows", () => {
    const shop = baseShop({
      hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [
          { open: "08:00", close: "12:00" },
          { open: "13:00", close: "18:00" },
        ],
      },
    });
    const ld = cafeJsonLd(shop);
    const spec = ld.openingHoursSpecification as Array<Record<string, unknown>>;
    expect(Array.isArray(spec)).toBe(true);
    expect(spec).toHaveLength(3);
    expect(spec[0].dayOfWeek).toBe("https://schema.org/Monday");
    expect(spec[0].opens).toBe("08:00");
    expect(spec[0].closes).toBe("18:00");
    const tueEntries = spec.filter(
      (e) => e.dayOfWeek === "https://schema.org/Tuesday",
    );
    expect(tueEntries).toHaveLength(2);
    expect(tueEntries[0].opens).toBe("08:00");
    expect(tueEntries[0].closes).toBe("12:00");
    expect(tueEntries[1].opens).toBe("13:00");
    expect(tueEntries[1].closes).toBe("18:00");
  });

  it("omits priceRange when price_band is null", () => {
    const shop = baseShop({ price_band: null });
    const ld = cafeJsonLd(shop);
    expect(ld).not.toHaveProperty("priceRange");
  });

  it("includes priceRange when price_band is set", () => {
    const shop = baseShop({ price_band: "€€" });
    const ld = cafeJsonLd(shop);
    expect(ld.priceRange).toBe("€€");
  });

  it("includes telephone and sameAs when available", () => {
    const shop = baseShop();
    const ld = cafeJsonLd(shop);
    expect(ld.telephone).toBe("+49 30 9706 9007");
    expect(ld.sameAs).toEqual([
      "https://bonanzacoffee.de",
      "https://instagram.com/bonanzacoffee",
    ]);
  });

  it("omits telephone and sameAs when null", () => {
    const shop = baseShop({
      phone: null,
      website_url: null,
      instagram_url: null,
    });
    const ld = cafeJsonLd(shop);
    expect(ld).not.toHaveProperty("telephone");
    expect(ld).not.toHaveProperty("sameAs");
  });

  it("strips undefined-valued keys (null postal_code)", () => {
    const shop = baseShop({ postal_code: null });
    const ld = cafeJsonLd(shop);
    const address = ld.address as Record<string, unknown>;
    expect(address).not.toHaveProperty("postalCode");
  });
});

describe("itemListJsonLd", () => {
  it("produces an ItemList with correct numberOfItems and positions", () => {
    const shops = [
      baseShop({ slug: "a", name: "A" }),
      baseShop({ slug: "b", name: "B" }),
      baseShop({ slug: "c", name: "C" }),
    ];
    const ld = itemListJsonLd(shops, "https://example.com/page");
    expect(ld["@type"]).toBe("ItemList");
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld.url).toBe("https://example.com/page");
    expect(ld.numberOfItems).toBe(3);
    const elements = ld.itemListElement as Array<Record<string, unknown>>;
    expect(elements).toHaveLength(3);
    expect(elements[0].position).toBe(1);
    expect(elements[1].position).toBe(2);
    expect(elements[2].position).toBe(3);
    expect(elements[0].url).toBe(
      "https://coffee-shop-berlin.example/cafes/a",
    );
    expect(elements[2].name).toBe("C");
  });
});

describe("breadcrumbJsonLd", () => {
  it("produces a BreadcrumbList with positions", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com" },
      { name: "Best", url: "https://example.com/best" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld["@context"]).toBe("https://schema.org");
    const elements = ld.itemListElement as Array<Record<string, unknown>>;
    expect(elements).toHaveLength(2);
    expect(elements[0].position).toBe(1);
    expect(elements[0].name).toBe("Home");
    expect(elements[0].item).toBe("https://example.com");
    expect(elements[1].position).toBe(2);
    expect(elements[1].item).toBe("https://example.com/best");
  });
});
