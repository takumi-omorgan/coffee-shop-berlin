import { afterEach, describe, expect, it, vi } from "vitest";
import type { CoffeeShop, Neighborhood } from "../../src/lib/types";
import shopsFixture from "../fixtures/shops.fixture.json";
import neighborhoodsFixture from "../fixtures/neighborhoods.fixture.json";

// The real `node:fs` ESM namespace is non-configurable, so vi.spyOn cannot
// redefine `readFileSync` on it. Substitute a pass-through copy so the
// namespace is configurable for vi.spyOn while default behavior still reads
// the real committed JSON files.
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual };
});

const allShops = shopsFixture as unknown as CoffeeShop[];
const allNeighborhoods = neighborhoodsFixture as unknown as Neighborhood[];
const visibleShops = allShops.filter(
  (s) => s.status === "active" || s.status === "temporarily_closed",
);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getShops", () => {
  it("returns only active + temporarily_closed shops (never closed)", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const shops = await data.getShops();

    expect(shops).toHaveLength(visibleShops.length);
    expect(shops.every((s) => s.status === "active" || s.status === "temporarily_closed"))
      .toBe(true);
    expect(shops.some((s) => s.status === "closed")).toBe(false);
    // Count of each allowed status matches the fixture entries.
    expect(shops.filter((s) => s.status === "active").length)
      .toBe(allShops.filter((s) => s.status === "active").length);
    expect(shops.filter((s) => s.status === "temporarily_closed").length)
      .toBe(allShops.filter((s) => s.status === "temporarily_closed").length);
  });

  it("caches shops in module scope (readFileSync called at most once for shops.json)", async () => {
    vi.resetModules();
    const fs = await import("node:fs");
    const spy = vi.spyOn(fs, "readFileSync");
    const data = await import("../../src/lib/data");

    await data.getShops();
    await data.getShops();

    const shopsCalls = spy.mock.calls.filter(
      (call) => typeof call[0] === "string" && call[0].endsWith("shops.json"),
    );
    expect(shopsCalls.length).toBeLessThanOrEqual(1);
  });

  it("rejects with 'supabase source not wired' when NEXT_PUBLIC_SUPABASE_URL is set", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    const data = await import("../../src/lib/data");

    await expect(data.getShops()).rejects.toThrow("supabase source not wired");
  });

  it("lets parser errors propagate when fs.readFileSync returns invalid data", async () => {
    vi.resetModules();
    const fs = await import("node:fs");
    vi.spyOn(fs, "readFileSync").mockReturnValue('[{"name":"Missing ID"}]');
    const data = await import("../../src/lib/data");

    await expect(data.getShops()).rejects.toThrow(/shops\[0\]|Field/);
  });
});

describe("getShopBySlug", () => {
  it("returns the shop for a known active slug", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const shop = await data.getShopBySlug("bonanza-coffee-heroes");
    expect(shop).not.toBeNull();
    expect(shop!.slug).toBe("bonanza-coffee-heroes");
    expect(shop!.status).toBe("active");
  });

  it("returns the shop for a known temporarily_closed slug", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const shop = await data.getShopBySlug("distrikt-coffee");
    expect(shop).not.toBeNull();
    expect(shop!.slug).toBe("distrikt-coffee");
    expect(shop!.status).toBe("temporarily_closed");
  });

  it("returns null for an unknown slug", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    expect(await data.getShopBySlug("does-not-exist")).toBeNull();
  });
});

describe("getShopsByNeighborhood", () => {
  it("groups correctly for a known neighborhood slug", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const slug = "kreuzberg";
    const expected = visibleShops.filter((s) => s.neighborhood_slug === slug);

    const result = await data.getShopsByNeighborhood(slug);

    expect(result).toHaveLength(expected.length);
    expect(result.every((s) => s.neighborhood_slug === slug)).toBe(true);
  });

  it("returns an empty array for an unknown neighborhood slug", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    expect(await data.getShopsByNeighborhood("nowhere")).toEqual([]);
  });
});

describe("getNeighborhoods", () => {
  it("returns all neighborhoods from the data file", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const neighborhoods = await data.getNeighborhoods();
    expect(neighborhoods).toHaveLength(allNeighborhoods.length);
    expect(neighborhoods.map((n) => n.slug).sort()).toEqual(
      allNeighborhoods.map((n) => n.slug).sort(),
    );
  });
});

describe("getNeighborhood", () => {
  it("returns the neighborhood for a known slug (hit)", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    const neighborhood = await data.getNeighborhood("kreuzberg");
    expect(neighborhood).not.toBeNull();
    expect(neighborhood!.slug).toBe("kreuzberg");
    expect(neighborhood!.name).toBe("Kreuzberg");
    expect(neighborhood!.intro.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown slug (miss)", async () => {
    vi.resetModules();
    const data = await import("../../src/lib/data");
    expect(await data.getNeighborhood("does-not-exist")).toBeNull();
  });
});
