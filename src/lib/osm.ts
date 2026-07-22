import type { CoffeeShop, DayKey, WeekHours } from "./types";

export const OVERPASS_QUERY = [
  "[out:json][timeout:60];",
  "area[\"ISO3166-2\"=\"DE-BE\"][\"admin_level\"=\"4\"]->.berlin;",
  "node[\"amenity\"=\"cafe\"](area.berlin);",
  "way[\"amenity\"=\"cafe\"](area.berlin);",
  "relation[\"amenity\"=\"cafe\"](area.berlin);",
  "out center tags;",
].join("\n");

const DAY_TOKENS: Record<string, DayKey> = {
  Mo: "mon",
  Tu: "tue",
  We: "wed",
  Th: "thu",
  Fr: "fri",
  Sa: "sat",
  Su: "sun",
};

const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseTimeWindow(raw: string): { open: string; close: string } | null {
  const dash = raw.indexOf("-");
  if (dash <= 0) return null;
  const open = raw.slice(0, dash).trim();
  const close = raw.slice(dash + 1).trim();
  if (!TIME_RE.test(open) || !TIME_RE.test(close) && close !== "24:00") return null;
  // close may be 24:00
  if (!TIME_RE.test(close)) {
    if (close !== "24:00") return null;
  }
  return { open, close };
}

function expandDayToken(token: string): DayKey[] | null {
  const key = DAY_TOKENS[token];
  if (!key) return null;
  return [key];
}

function expandDayRange(range: string): DayKey[] | null {
  const dash = range.indexOf("-");
  if (dash < 0) return expandDayToken(range);
  const startTok = range.slice(0, dash).trim();
  const endTok = range.slice(dash + 1).trim();
  const start = DAY_TOKENS[startTok];
  const end = DAY_TOKENS[endTok];
  if (!start || !end) return null;
  const si = DAY_ORDER.indexOf(start);
  const ei = DAY_ORDER.indexOf(end);
  if (si < 0 || ei < 0 || ei < si) return null;
  const out: DayKey[] = [];
  for (let i = si; i <= ei; i++) out.push(DAY_ORDER[i]);
  return out;
}

function expandDaySpec(spec: string): DayKey[] | null {
  const parts = spec.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const result: DayKey[] = [];
  const seen = new Set<DayKey>();
  for (const part of parts) {
    const days = expandDayRange(part);
    if (days === null) return null;
    for (const d of days) {
      if (!seen.has(d)) {
        seen.add(d);
        result.push(d);
      }
    }
  }
  return result;
}

export function parseOpeningHours(osmValue: string): WeekHours | null {
  if (typeof osmValue !== "string") return null;
  const value = osmValue.trim();
  if (value.length === 0) return null;
  const rules = value.split(";").map((r) => r.trim()).filter(Boolean);
  if (rules.length === 0) return null;

  const week: WeekHours = {};
  for (const rule of rules) {
    const firstSpace = rule.indexOf(" ");
    if (firstSpace < 0) return null;
    const daySpec = rule.slice(0, firstSpace).trim();
    const timeSpec = rule.slice(firstSpace + 1).trim();
    if (daySpec.length === 0 || timeSpec.length === 0) return null;

    const days = expandDaySpec(daySpec);
    if (days === null || days.length === 0) return null;

    const timeParts = timeSpec.split(",").map((t) => t.trim()).filter(Boolean);
    if (timeParts.length === 0) return null;
    const windows: { open: string; close: string }[] = [];
    for (const tp of timeParts) {
      const w = parseTimeWindow(tp);
      if (w === null) return null;
      windows.push(w);
    }

    for (const day of days) {
      const existing = week[day];
      if (existing) {
        for (const w of windows) existing.push(w);
      } else {
        week[day] = windows.map((w) => ({ ...w }));
      }
    }
  }
  return week;
}

function asNumber(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

type StringMap = Record<string, string>;
type Elem = Record<string, unknown>;

function isStringMap(v: unknown): v is StringMap {
  if (!v || typeof v !== "object") return false;
  for (const val of Object.values(v as Record<string, unknown>)) {
    if (typeof val !== "string") return false;
  }
  return true;
}

function getTags(el: unknown): StringMap {
  if (!el || typeof el !== "object") return {};
  const tags = (el as Elem).tags;
  if (!isStringMap(tags)) return {};
  return tags;
}

function getCoords(el: unknown): { lat: number; lon: number } | null {
  if (!el || typeof el !== "object") return null;
  const rec = el as Elem;
  const lat = asNumber(rec.lat);
  const lon = asNumber(rec.lon);
  if (lat !== null && lon !== null) return { lat, lon };
  const center = rec.center;
  if (center && typeof center === "object") {
    const c = center as Elem;
    const clat = asNumber(c.lat);
    const clon = asNumber(c.lon);
    if (clat !== null && clon !== null) return { lat: clat, lon: clon };
  }
  return null;
}

function assembleAddress(tags: Record<string, string>): string {
  const street = tags["addr:street"] ?? "";
  const housenumber = tags["addr:housenumber"] ?? "";
  const postcode = tags["addr:postcode"] ?? "";
  const city = tags["addr:city"] ?? "";

  const parts: string[] = [];
  if (street) {
    let line = street;
    if (housenumber) line += " " + housenumber;
    parts.push(line);
  } else if (housenumber) {
    parts.push(housenumber);
  }
  if (postcode) parts.push(postcode);
  if (city) parts.push(city);
  return parts.join(", ");
}

function nonEmptyCount(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "string") return v.trim().length > 0 ? 1 : 0;
  if (Array.isArray(v)) return v.length > 0 ? 1 : 0;
  if (typeof v === "object") {
    const rec = v as Record<string, unknown>;
    let c = 0;
    for (const k of Object.keys(rec)) {
      if (nonEmptyCount(rec[k]) > 0) c++;
    }
    return c;
  }
  if (typeof v === "number") return Number.isFinite(v) ? 1 : 0;
  if (typeof v === "boolean") return 1;
  return 0;
}

export function mapOsmElement(el: unknown): Partial<CoffeeShop> | null {
  if (!el || typeof el !== "object") return null;
  const tags = getTags(el) ?? {};
  const name = typeof tags.name === "string" ? tags.name.trim() : "";
  if (name.length === 0) return null;
  const coords = getCoords(el);
  if (coords === null) return null;

  const result: Partial<CoffeeShop> = {
    name,
    latitude: coords.lat,
    longitude: coords.lon,
  };

  const address_full = assembleAddress(tags);
  result.address_full = address_full;
  result.postal_code = tags["addr:postcode"] ? tags["addr:postcode"] : null;

  result.website_url = tags.website ?? tags["contact:website"] ?? null;
  result.phone = tags.phone ?? tags["contact:phone"] ?? null;

  if ("opening_hours" in tags && tags.opening_hours !== undefined && tags.opening_hours !== null) {
    result.hours = parseOpeningHours(String(tags.opening_hours));
  } else {
    result.hours = null;
  }

  if (tags.amenity === "cafe" || tags.amenity === undefined) {
    result.venue_type = "cafe";
  } else {
    result.venue_type = "cafe";
  }

  return result;
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function haversineMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function dedupeShops(
  shops: Partial<CoffeeShop>[],
): Partial<CoffeeShop>[] {
  const result: Partial<CoffeeShop>[] = [];
  for (const shop of shops) {
    let mergedIndex = -1;
    if (
      typeof shop.name === "string" &&
      typeof shop.latitude === "number" &&
      typeof shop.longitude === "number" &&
      Number.isFinite(shop.latitude) &&
      Number.isFinite(shop.longitude)
    ) {
      const norm = normalizeName(shop.name);
      for (let i = 0; i < result.length; i++) {
        const other = result[i];
        if (
          typeof other.name !== "string" ||
          typeof other.latitude !== "number" ||
          typeof other.longitude !== "number"
        )
          continue;
        if (normalizeName(other.name) !== norm) continue;
        const dist = haversineMeters(
          { lat: shop.latitude, lon: shop.longitude },
          { lat: other.latitude, lon: other.longitude },
        );
        if (dist <= 150) {
          mergedIndex = i;
          break;
        }
      }
    }
    if (mergedIndex >= 0) {
      const existing = result[mergedIndex];
      const existingCount = nonEmptyCount(existing);
      const shopCount = nonEmptyCount(shop);
      if (shopCount > existingCount) {
        result[mergedIndex] = shop;
      }
    } else {
      result.push(shop);
    }
  }
  return result;
}
