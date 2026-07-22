export type ShopStatus = "active" | "temporarily_closed" | "closed";
export type VenueType = "cafe" | "roastery_cafe" | "bakery_cafe" | "multi_roaster";
export type PriceBand = "€" | "€€" | "€€€";
export type PowerOutlets = "none" | "few" | "some" | "many";
export type NoiseLevel = "quiet" | "moderate" | "lively";
export type LaptopFriendly = "yes" | "mixed" | "no";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface HoursWindow { open: string; close: string } // "08:00", 24h, close may be "24:00"
export type WeekHours = Partial<Record<DayKey, HoursWindow[]>>;
export interface CoffeeShop {
  id: string; name: string; slug: string; status: ShopStatus;
  address_full: string; postal_code: string | null;
  neighborhood_slug: string; latitude: number; longitude: number;
  website_url: string | null; instagram_url: string | null;
  phone: string | null; google_maps_url: string | null;
  hours: WeekHours | null;
  specialty_coffee: boolean; venue_type: VenueType;
  coffee_methods: string[]; price_band: PriceBand | null;
  wifi_available: boolean | null; power_outlets: PowerOutlets | null;
  noise_level: NoiseLevel | null; laptop_friendly: LaptopFriendly | null;
  outdoor_seating: boolean | null; vibe_tags: string[];
  editor_note: string | null; primary_photo_url: string | null;
  last_verified_at: string | null; // ISO date
}
export interface Neighborhood { slug: string; name: string; intro: string }
export interface ShopPhoto {
  shop_id: string; url: string; caption: string | null;
  sort_order: number; license: string; attribution: string | null;
  source_url: string | null;
}
