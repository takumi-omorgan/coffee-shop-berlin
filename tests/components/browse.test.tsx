// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { CoffeeShop } from "@/lib/types";

let params = new URLSearchParams();
function setParams(next: Record<string, string>) {
  params = new URLSearchParams(next);
}

const routerReplace = vi.fn();
const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => params,
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
  usePathname: () => "/browse",
}));

import BrowseClient from "@/components/BrowseClient";

function makeShop(overrides: Partial<CoffeeShop> = {}): CoffeeShop {
  return {
    id: "shop_base",
    name: "Base Shop",
    slug: "base-shop",
    status: "active",
    address_full: "Some Str. 1, 10111 Berlin",
    postal_code: "10111",
    neighborhood_slug: "mitte",
    latitude: 52.52,
    longitude: 13.405,
    website_url: null,
    instagram_url: null,
    phone: null,
    google_maps_url: null,
    hours: null,
    specialty_coffee: true,
    venue_type: "cafe",
    coffee_methods: [],
    price_band: "€€",
    wifi_available: true,
    power_outlets: "some",
    noise_level: "moderate",
    laptop_friendly: "yes",
    outdoor_seating: false,
    vibe_tags: ["cozy"],
    editor_note: null,
    primary_photo_url: null,
    last_verified_at: "2026-05-01",
    ...overrides,
  };
}

const fixtures: CoffeeShop[] = [
  makeShop({
    id: "a",
    name: "Anker Kaffee",
    slug: "anker-kaffee",
    neighborhood_slug: "mitte",
    laptop_friendly: "yes",
    vibe_tags: ["cozy"],
  }),
  makeShop({
    id: "b",
    name: "Bonanza Coffee Heroes",
    slug: "bonanza-coffee-heroes",
    neighborhood_slug: "prenzlauer-berg",
    laptop_friendly: "no",
    vibe_tags: ["third_wave"],
  }),
  makeShop({
    id: "c",
    name: "Couture Café",
    slug: "couture-cafe",
    neighborhood_slug: "kreuzberg",
    laptop_friendly: "yes",
    vibe_tags: ["minimalist"],
  }),
  makeShop({
    id: "d",
    name: "Distrikt Coffee",
    slug: "distrikt-coffee",
    neighborhood_slug: "moabit",
    laptop_friendly: null,
    vibe_tags: ["bustling"],
  }),
];

const neighborhoods = [
  { slug: "mitte", name: "Mitte", intro: "" },
  { slug: "prenzlauer-berg", name: "Prenzlauer Berg", intro: "" },
  { slug: "kreuzberg", name: "Kreuzberg", intro: "" },
  { slug: "moabit", name: "Moabit", intro: "" },
];

describe("BrowseClient", () => {
  afterEach(() => {
    cleanup();
    routerReplace.mockClear();
    routerPush.mockClear();
  });
  beforeEach(() => {
    setParams({});
  });

  it("renders all active shops unfiltered", () => {
    render(<BrowseClient shops={fixtures} neighborhoods={neighborhoods} />);
    expect(screen.getByText("Anker Kaffee")).toBeTruthy();
    expect(screen.getByText("Bonanza Coffee Heroes")).toBeTruthy();
    expect(screen.getByText("Couture Café")).toBeTruthy();
    expect(screen.getByText("Distrikt Coffee")).toBeTruthy();
  });

  it("narrows to laptop-friendly shops when laptop=1", () => {
    setParams({ laptop: "1" });
    render(<BrowseClient shops={fixtures} neighborhoods={neighborhoods} />);
    expect(screen.getByText("Anker Kaffee")).toBeTruthy();
    expect(screen.queryByText("Bonanza Coffee Heroes")).toBeNull();
  });

  it("narrows by name when q is set", () => {
    setParams({ q: "Bonanza" });
    render(<BrowseClient shops={fixtures} neighborhoods={neighborhoods} />);
    expect(screen.getByText("Bonanza Coffee Heroes")).toBeTruthy();
    expect(screen.queryByText("Anker Kaffee")).toBeNull();
  });

  it("renders the empty state when nothing matches", () => {
    setParams({ q: "zzz-no-match" });
    render(<BrowseClient shops={fixtures} neighborhoods={neighborhoods} />);
    expect(screen.getByText("No cafés match your filters.")).toBeTruthy();
  });

  it("updates the URL with laptop=1 when the Laptop-friendly checkbox is toggled", () => {
    render(<BrowseClient shops={fixtures} neighborhoods={neighborhoods} />);
    const cb = screen.getByLabelText("Laptop-friendly") as HTMLInputElement;
    fireEvent.click(cb);
    expect(routerReplace).toHaveBeenCalledTimes(1);
    const callArg = routerReplace.mock.calls[0][0] as string;
    expect(callArg).toContain("laptop=1");
  });
});
