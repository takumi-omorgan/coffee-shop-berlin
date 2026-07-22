import { describe, expect, it } from "vitest";
import {
  OVERPASS_QUERY,
  dedupeShops,
  mapOsmElement,
  parseOpeningHours,
} from "../../src/lib/osm";
import type { CoffeeShop } from "../../src/lib/types";

describe("OVERPASS_QUERY", () => {
  it("is a non-empty Overpass QL string selecting amenity=cafe with out center", () => {
    expect(typeof OVERPASS_QUERY).toBe("string");
    expect(OVERPASS_QUERY.length).toBeGreaterThan(0);
    expect(OVERPASS_QUERY).toContain("amenity");
    expect(OVERPASS_QUERY).toContain("cafe");
    expect(OVERPASS_QUERY).toMatch(/out center/);
  });
});

describe("mapOsmElement — node", () => {
  it("maps a node element with top-level lat/lon and addr:* tags", () => {
    const el = {
      type: "node",
      id: 1,
      lat: 52.5074,
      lon: 13.405,
      tags: {
        amenity: "cafe",
        name: "Bonanza Coffee Heroes",
        "addr:street": "Oderberger Straße",
        "addr:housenumber": "35",
        "addr:postcode": "10435",
        "addr:city": "Berlin",
        website: "https://bonanzacoffee.de",
        phone: "+49 30 1234567",
        opening_hours: "Mo-Fr 08:00-18:00; Sa 09:00-16:00",
      },
    };
    const result = mapOsmElement(el);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Bonanza Coffee Heroes");
    expect(result!.latitude).toBe(52.5074);
    expect(result!.longitude).toBe(13.405);
    expect(result!.address_full).toContain("Oderberger Straße 35");
    expect(result!.address_full).toContain("10435");
    expect(result!.postal_code).toBe("10435");
    expect(result!.website_url).toBe("https://bonanzacoffee.de");
    expect(result!.phone).toBe("+49 30 1234567");
    expect(result!.venue_type).toBe("cafe");
    expect(result!.hours).not.toBeNull();
    expect(result!.hours!.mon).toEqual([{ open: "08:00", close: "18:00" }]);
  });

  it("maps a way element using center.lat/center.lon when no top-level lat/lon", () => {
    const el = {
      type: "way",
      id: 2001,
      center: { lat: 52.5234, lon: 13.4109 },
      tags: {
        amenity: "cafe",
        name: "Mitte Way Cafe",
      },
    };
    const result = mapOsmElement(el);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Mitte Way Cafe");
    expect(result!.latitude).toBe(52.5234);
    expect(result!.longitude).toBe(13.4109);
  });

  it("returns null for an element with no name", () => {
    const el = {
      type: "node",
      id: 999,
      lat: 52.5,
      lon: 13.4,
      tags: { amenity: "cafe" },
    };
    expect(mapOsmElement(el)).toBeNull();
  });

  it("returns null for an element with no coordinates", () => {
    const el = {
      type: "node",
      id: 998,
      tags: { amenity: "cafe", name: "Float Away Cafe" },
    };
    expect(mapOsmElement(el)).toBeNull();
  });

  it("returns null for a non-object input", () => {
    expect(mapOsmElement(null)).toBeNull();
    expect(mapOsmElement("foo")).toBeNull();
    expect(mapOsmElement(undefined)).toBeNull();
  });

  it("sets hours null when opening_hours tag is unparseable but still maps", () => {
    const el = {
      type: "node",
      id: 2,
      lat: 52.5,
      lon: 13.4,
      tags: { amenity: "cafe", name: "Always Open Cafe", opening_hours: "24/7" },
    };
    const result = mapOsmElement(el);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Always Open Cafe");
    expect(result!.hours).toBeNull();
  });
});

describe("parseOpeningHours", () => {
  it("parses a range rule and a single-day rule", () => {
    const week = parseOpeningHours("Mo-Fr 08:00-18:00; Sa 09:00-16:00");
    expect(week).not.toBeNull();
    expect(week!.mon).toEqual([{ open: "08:00", close: "18:00" }]);
    expect(week!.fri).toEqual([{ open: "08:00", close: "18:00" }]);
    expect(week!.sat).toEqual([{ open: "09:00", close: "16:00" }]);
    expect(week!.sun).toBeUndefined();
  });

  it("parses a comma-list day spec and multiple time ranges", () => {
    const week = parseOpeningHours("Mo,We,Fr 09:00-12:00,13:00-18:00");
    expect(week).not.toBeNull();
    expect(week!.mon).toEqual([
      { open: "09:00", close: "12:00" },
      { open: "13:00", close: "18:00" },
    ]);
    expect(week!.wed).toEqual([
      { open: "09:00", close: "12:00" },
      { open: "13:00", close: "18:00" },
    ]);
    expect(week!.tue).toBeUndefined();
  });

  it("parses a Mo-Su full-week range", () => {
    const week = parseOpeningHours("Mo-Su 08:00-19:00");
    expect(week).not.toBeNull();
    for (const d of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const) {
      expect(week![d]).toEqual([{ open: "08:00", close: "19:00" }]);
    }
  });

  it("returns null for empty string", () => {
    expect(parseOpeningHours("")).toBeNull();
    expect(parseOpeningHours("   ")).toBeNull();
  });

  it("returns null for unparseable values (24/7, garbage, PH off)", () => {
    expect(parseOpeningHours("24/7")).toBeNull();
    expect(parseOpeningHours("garbage")).toBeNull();
    expect(parseOpeningHours("PH off")).toBeNull();
    expect(parseOpeningHours("by appointment")).toBeNull();
    expect(parseOpeningHours("Mo-Fr 08:00")).toBeNull();
    expect(parseOpeningHours("Mo 25:00-26:00")).toBeNull();
    expect(parseOpeningHours("Xy 08:00-18:00")).toBeNull();
  });
});

describe("dedupeShops", () => {
  type Shop = Partial<CoffeeShop>;

  it("collapses two same-name records within 150m, keeping the richer one", () => {
    // Two points ~70m apart (same name), one richer than the other.
    const shops: Shop[] = [
      {
        name: "Duplicate Drip Cafe",
        latitude: 52.52,
        longitude: 13.406,
        address_full: "Lindenstraße 5",
        website_url: "https://drip.example",
      },
      {
        name: "duplicate drip cafe",
        latitude: 52.5201,
        longitude: 13.4065,
      },
    ];
    const result = dedupeShops(shops);
    expect(result).toHaveLength(1);
    expect(result[0].website_url).toBe("https://drip.example");
    expect(result[0].address_full).toBe("Lindenstraße 5");
  });

  it("keeps two same-name records more than 150m apart separate", () => {
    // ~300m+ apart using coordinate delta.
    const shops: Shop[] = [
      { name: "Sibling Cafe", latitude: 52.54, longitude: 13.35 },
      { name: "Sibling Cafe", latitude: 52.545, longitude: 13.355 },
    ];
    const result = dedupeShops(shops);
    expect(result).toHaveLength(2);
  });

  it("does not merge records missing coordinates", () => {
    const shops: Shop[] = [
      { name: "No Coords", address_full: "Somewhere" },
      { name: "No Coords" },
    ];
    const result = dedupeShops(shops);
    expect(result).toHaveLength(2);
  });

  it("does not mutate the input array", () => {
    const shops: Shop[] = [
      { name: "A", latitude: 52.52, longitude: 13.406 },
      { name: "A", latitude: 52.5201, longitude: 13.4065 },
    ];
    const snapshot = shops.map((s) => ({ ...s }));
    dedupeShops(shops);
    expect(shops).toEqual(snapshot);
  });
});

describe("fixture sanity check", () => {
  it("maps and dedupes the committed fixture into a sensible result", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raw = fs.readFileSync(
      path.resolve(__dirname, "../fixtures/overpass-response.fixture.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as { elements: unknown[] };
    const mapped = parsed.elements
      .map(mapOsmElement)
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const deduped = dedupeShops(mapped);
    // Skipped: the no-name one + the no-coords one + the unparseable-hours ones
    // still map (only name/coords cause a skip at map step).
    expect(mapped.length).toBeLessThan(parsed.elements.length);
    expect(deduped.length).toBeLessThanOrEqual(mapped.length);
    // The Duplicate Drip Cafe pair should collapse.
    const drips = deduped.filter((s) =>
      s.name?.toLowerCase().includes("duplicate drip"),
    );
    expect(drips).toHaveLength(1);
    // The distant sibling pair should NOT collapse.
    const siblings = deduped.filter((s) =>
      s.name?.toLowerCase().includes("distant sibling"),
    );
    expect(siblings).toHaveLength(2);
  });
});
