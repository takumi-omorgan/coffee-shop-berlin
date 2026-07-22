import type { CoffeeShop, DayKey, WeekHours } from "./types";
import { SITE } from "./site";

const DAY_NAMES: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function openingHoursSpecification(
  hours: WeekHours,
): Array<{ "@type": string; dayOfWeek: string; opens: string; closes: string }> {
  const entries: Array<{
    "@type": string;
    dayOfWeek: string;
    opens: string;
    closes: string;
  }> = [];
  for (const day of Object.keys(DAY_NAMES) as DayKey[]) {
    const windows = hours[day];
    if (!windows || windows.length === 0) continue;
    for (const window of windows) {
      entries.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${DAY_NAMES[day]}`,
        opens: window.open,
        closes: window.close,
      });
    }
  }
  return entries;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

export function cafeJsonLd(shop: CoffeeShop): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: shop.name,
    url: `${SITE.url}/cafes/${shop.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address_full,
      addressLocality: "Berlin",
      postalCode: shop.postal_code ?? undefined,
      addressCountry: "DE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: shop.latitude,
      longitude: shop.longitude,
    },
  };

  if (shop.price_band !== null) {
    obj.priceRange = shop.price_band;
  }

  if (shop.hours !== null) {
    const spec = openingHoursSpecification(shop.hours);
    if (spec.length > 0) {
      obj.openingHoursSpecification = spec;
    }
  }

  if (shop.phone !== null) {
    obj.telephone = shop.phone;
  }

  const sameAs: string[] = [];
  if (shop.website_url !== null) sameAs.push(shop.website_url);
  if (shop.instagram_url !== null) sameAs.push(shop.instagram_url);
  if (sameAs.length > 0) {
    obj.sameAs = sameAs;
  }

  // Clean nested address (strip undefined postalCode).
  obj.address = stripUndefined(obj.address as Record<string, unknown>);

  return stripUndefined(obj);
}

export function itemListJsonLd(
  shops: CoffeeShop[],
  pageUrl: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    numberOfItems: shops.length,
    itemListElement: shops.map((shop, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/cafes/${shop.slug}`,
      name: shop.name,
    })),
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
