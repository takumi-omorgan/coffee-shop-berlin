import type {
  CoffeeShop,
  DayKey,
  HoursWindow,
  Neighborhood,
  NoiseLevel,
  LaptopFriendly,
  PowerOutlets,
  PriceBand,
  ShopStatus,
  VenueType,
  WeekHours,
} from "./types";

const SHOP_STATUS: ShopStatus[] = ["active", "temporarily_closed", "closed"];
const VENUE_TYPES: VenueType[] = ["cafe", "roastery_cafe", "bakery_cafe", "multi_roaster"];
const PRICE_BANDS: PriceBand[] = ["€", "€€", "€€€"];
const POWER_OUTLETS: PowerOutlets[] = ["none", "few", "some", "many"];
const NOISE_LEVELS: NoiseLevel[] = ["quiet", "moderate", "lively"];
const LAPTOP_FRIENDLY: LaptopFriendly[] = ["yes", "mixed", "no"];
const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_KEY_SET = new Set<string>(DAY_KEYS);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function assertString(value: unknown, field: string): string {
  if (!isString(value)) {
    throw new Error(`Field "${field}" must be a string`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, field: string): string {
  if (!isString(value) || value.length === 0) {
    throw new Error(`Field "${field}" must be a non-empty string`);
  }
  return value;
}

function assertNumber(value: unknown, field: string): number {
  if (!isNumber(value)) {
    throw new Error(`Field "${field}" must be a number`);
  }
  return value;
}

function assertBoolean(value: unknown, field: string): boolean {
  if (!isBoolean(value)) {
    throw new Error(`Field "${field}" must be a boolean`);
  }
  return value;
}

function assertStringArray(value: unknown, field: string): string[] {
  if (!isStringArray(value)) {
    throw new Error(`Field "${field}" must be an array of strings`);
  }
  return value;
}

function assertEnum<T extends string>(
  value: unknown,
  allowed: T[],
  field: string,
): T {
  if (!isString(value) || !allowed.includes(value as T)) {
    throw new Error(
      `Field "${field}" must be one of ${JSON.stringify(allowed)}`,
    );
  }
  return value as T;
}

function assertNullable<T>(
  value: unknown,
  checker: (v: unknown, field: string) => T,
  field: string,
): T | null {
  if (value === null) return null;
  return checker(value, field);
}

const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$|^24:00$/;

function assertHoursWindow(value: unknown, field: string): HoursWindow {
  if (!isObject(value)) {
    throw new Error(`Field "${field}" must be an object`);
  }
  const open = value.open;
  const close = value.close;
  if (!isString(open) || !TIME_RE.test(open)) {
    throw new Error(`Field "${field}.open" must be a 24h time string`);
  }
  if (!isString(close) || !TIME_RE.test(close)) {
    throw new Error(`Field "${field}.close" must be a 24h time string`);
  }
  return { open, close };
}

function assertWeekHours(value: unknown, field: string): WeekHours {
  if (!isObject(value)) {
    throw new Error(`Field "${field}" must be an object`);
  }
  const result: WeekHours = {};
  for (const key of Object.keys(value)) {
    if (!DAY_KEY_SET.has(key)) {
      throw new Error(
        `Field "${field}" has an invalid day key "${key}"`,
      );
    }
    const windows = (value as Record<string, unknown>)[key];
    if (!Array.isArray(windows) || !windows.every((w) => isObject(w))) {
      throw new Error(`Field "${field}.${key}" must be an array of hours windows`);
    }
    result[key as DayKey] = windows.map((w) =>
      assertHoursWindow(w, `${field}.${key}`),
    );
  }
  return result;
}

export function parseShop(raw: unknown): CoffeeShop {
  if (!isObject(raw)) {
    throw new Error("Shop must be an object");
  }

  const id = assertNonEmptyString(raw.id, "id");
  const name = assertNonEmptyString(raw.name, "name");
  const slug = assertNonEmptyString(raw.slug, "slug");
  const status = assertEnum(raw.status, SHOP_STATUS, "status");
  const address_full = assertNonEmptyString(raw.address_full, "address_full");
  const postal_code = assertNullable(raw.postal_code, assertString, "postal_code");
  const neighborhood_slug = assertNonEmptyString(
    raw.neighborhood_slug,
    "neighborhood_slug",
  );
  const latitude = assertNumber(raw.latitude, "latitude");
  const longitude = assertNumber(raw.longitude, "longitude");
  const website_url = assertNullable(raw.website_url, assertString, "website_url");
  const instagram_url = assertNullable(raw.instagram_url, assertString, "instagram_url");
  const phone = assertNullable(raw.phone, assertString, "phone");
  const google_maps_url = assertNullable(raw.google_maps_url, assertString, "google_maps_url");
  const hours = assertNullable(raw.hours, assertWeekHours, "hours");
  const specialty_coffee = assertBoolean(raw.specialty_coffee, "specialty_coffee");
  const venue_type = assertEnum(raw.venue_type, VENUE_TYPES, "venue_type");
  const coffee_methods = assertStringArray(raw.coffee_methods, "coffee_methods");
  const price_band = assertNullable(
    raw.price_band,
    (v: unknown, f: string) => assertEnum(v, PRICE_BANDS, f),
    "price_band",
  );
  const wifi_available = assertNullable(
    raw.wifi_available,
    (v: unknown, f: string) => assertBoolean(v, f),
    "wifi_available",
  );
  const power_outlets = assertNullable(
    raw.power_outlets,
    (v: unknown, f: string) => assertEnum(v, POWER_OUTLETS, f),
    "power_outlets",
  );
  const noise_level = assertNullable(
    raw.noise_level,
    (v: unknown, f: string) => assertEnum(v, NOISE_LEVELS, f),
    "noise_level",
  );
  const laptop_friendly = assertNullable(
    raw.laptop_friendly,
    (v: unknown, f: string) => assertEnum(v, LAPTOP_FRIENDLY, f),
    "laptop_friendly",
  );
  const outdoor_seating = assertNullable(
    raw.outdoor_seating,
    (v: unknown, f: string) => assertBoolean(v, f),
    "outdoor_seating",
  );
  const vibe_tags = assertStringArray(raw.vibe_tags, "vibe_tags");
  const editor_note = assertNullable(raw.editor_note, assertString, "editor_note");
  const primary_photo_url = assertNullable(
    raw.primary_photo_url,
    assertString,
    "primary_photo_url",
  );
  const last_verified_at = assertNullable(
    raw.last_verified_at,
    assertString,
    "last_verified_at",
  );

  return {
    id,
    name,
    slug,
    status,
    address_full,
    postal_code,
    neighborhood_slug,
    latitude,
    longitude,
    website_url,
    instagram_url,
    phone,
    google_maps_url,
    hours,
    specialty_coffee,
    venue_type,
    coffee_methods,
    price_band,
    wifi_available,
    power_outlets,
    noise_level,
    laptop_friendly,
    outdoor_seating,
    vibe_tags,
    editor_note,
    primary_photo_url,
    last_verified_at,
  };
}

export function parseShops(raw: unknown): CoffeeShop[] {
  if (!Array.isArray(raw)) {
    throw new Error("parseShops requires an array");
  }
  return raw.map((entry, index) => {
    try {
      return parseShop(entry);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`shops[${index}]: ${err.message}`);
      }
      throw new Error(`shops[${index}]: invalid entry`);
    }
  });
}

export function parseNeighborhoods(raw: unknown): Neighborhood[] {
  if (!Array.isArray(raw)) {
    throw new Error("parseNeighborhoods requires an array");
  }
  return raw.map((entry, index) => {
    if (!isObject(entry)) {
      throw new Error(`neighborhoods[${index}]: must be an object`);
    }
    try {
      const slug = assertNonEmptyString(entry.slug, "slug");
      const name = assertNonEmptyString(entry.name, "name");
      const intro = assertNonEmptyString(entry.intro, "intro");
      return { slug, name, intro };
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`neighborhoods[${index}]: ${err.message}`);
      }
      throw new Error(`neighborhoods[${index}]: invalid entry`);
    }
  });
}
