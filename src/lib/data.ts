import * as fs from "node:fs";
import * as path from "node:path";
import type { CoffeeShop, Neighborhood } from "./types";
import { parseNeighborhoods, parseShops } from "./validate";

let shopsCache: CoffeeShop[] | null = null;
let neighborhoodsCache: Neighborhood[] | null = null;

function loadFromSupabase(): never {
  throw new Error("supabase source not wired");
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function ensureShops(): CoffeeShop[] {
  if (isSupabaseConfigured()) {
    loadFromSupabase();
  }
  if (shopsCache !== null) {
    return shopsCache;
  }
  const filePath = path.join(process.cwd(), "data", "shops.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  shopsCache = parseShops(parsed);
  return shopsCache;
}

function ensureNeighborhoods(): Neighborhood[] {
  if (isSupabaseConfigured()) {
    loadFromSupabase();
  }
  if (neighborhoodsCache !== null) {
    return neighborhoodsCache;
  }
  const filePath = path.join(process.cwd(), "data", "neighborhoods.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  neighborhoodsCache = parseNeighborhoods(parsed);
  return neighborhoodsCache;
}

export async function getShops(): Promise<CoffeeShop[]> {
  return ensureShops().filter(
    (shop) => shop.status === "active" || shop.status === "temporarily_closed",
  );
}

export async function getShopBySlug(slug: string): Promise<CoffeeShop | null> {
  const shops = ensureShops();
  return shops.find((shop) => shop.slug === slug) ?? null;
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  return ensureNeighborhoods();
}

export async function getNeighborhood(slug: string): Promise<Neighborhood | null> {
  const neighborhoods = ensureNeighborhoods();
  return neighborhoods.find((n) => n.slug === slug) ?? null;
}

export async function getShopsByNeighborhood(slug: string): Promise<CoffeeShop[]> {
  const shops = await getShops();
  return shops.filter((shop) => shop.neighborhood_slug === slug);
}
