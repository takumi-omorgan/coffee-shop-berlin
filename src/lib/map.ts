import type { CoffeeShop } from "./types";

export interface MapPin {
  slug: string;
  name: string;
  lat: number;
  lon: number;
}

export function shopsToPins(shops: CoffeeShop[]): MapPin[] {
  const pins: MapPin[] = [];
  for (const shop of shops) {
    if (!Number.isFinite(shop.latitude) || !Number.isFinite(shop.longitude)) {
      continue;
    }
    pins.push({
      slug: shop.slug,
      name: shop.name,
      lat: shop.latitude,
      lon: shop.longitude,
    });
  }
  return pins;
}
