import type { CoffeeShop } from "./types";
import { isOpenAt } from "./hours";

export interface ShopFilters {
  neighborhood?: string;
  openAt?: Date;
  laptopFriendly?: boolean;
  wifi?: boolean;
  outdoor?: boolean;
  vibe?: string;
  query?: string;
}

export function filterShops(shops: CoffeeShop[], f: ShopFilters): CoffeeShop[] {
  const out: CoffeeShop[] = [];
  for (const shop of shops) {
    if (shop.status !== "active") continue;
    if (f.neighborhood !== undefined && shop.neighborhood_slug !== f.neighborhood) continue;
    if (f.openAt !== undefined && !isOpenAt(shop.hours, f.openAt)) continue;
    if (f.laptopFriendly === true && shop.laptop_friendly !== "yes") continue;
    if (f.wifi === true && shop.wifi_available !== true) continue;
    if (f.outdoor === true && shop.outdoor_seating !== true) continue;
    if (f.vibe !== undefined && !shop.vibe_tags.includes(f.vibe)) continue;
    if (
      f.query !== undefined &&
      f.query !== "" &&
      !shop.name.toLowerCase().includes(f.query.toLowerCase())
    )
      continue;
    out.push(shop);
  }
  return out;
}
