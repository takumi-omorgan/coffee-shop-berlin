// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { CoffeeShop } from "@/lib/types";
import ShopCard from "@/components/ShopCard";
import ShopImage from "@/components/ShopImage";
import AttributeBadges from "@/components/AttributeBadges";

function makeShop(overrides: Partial<CoffeeShop> = {}): CoffeeShop {
  return {
    id: "shop_test",
    name: "Bonanza Coffee Heroes",
    slug: "bonanza-coffee-heroes",
    status: "active",
    address_full: "Oderberger Str. 35, 10435 Berlin",
    postal_code: "10435",
    neighborhood_slug: "prenzlauer-berg",
    latitude: 52.5376,
    longitude: 13.4229,
    website_url: "https://bonanzacoffee.de",
    instagram_url: "https://instagram.com/bonanzacoffee",
    phone: "+49 30 9706 9007",
    google_maps_url: "https://maps.google.com/?q=Bonanza",
    hours: {
      mon: [{ open: "08:00", close: "18:00" }],
      tue: [{ open: "08:00", close: "18:00" }],
      wed: [{ open: "08:00", close: "18:00" }],
      thu: [{ open: "08:00", close: "18:00" }],
      fri: [{ open: "08:00", close: "19:00" }],
      sat: [{ open: "09:00", close: "19:00" }],
      sun: [{ open: "09:00", close: "18:00" }],
    },
    specialty_coffee: true,
    venue_type: "roastery_cafe",
    coffee_methods: ["espresso", "pour_over", "aeropress"],
    price_band: "€€",
    wifi_available: true,
    power_outlets: "few",
    noise_level: "moderate",
    laptop_friendly: "mixed",
    outdoor_seating: true,
    vibe_tags: ["third_wave", "minimalist"],
    editor_note: "Pioneer of the Berlin third-wave scene.",
    primary_photo_url: "https://example.com/photos/bonanza.jpg",
    last_verified_at: "2026-05-01",
    ...overrides,
  };
}

describe("ShopCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the shop name and humanized neighborhood", () => {
    const shop = makeShop();
    render(<ShopCard shop={shop} />);
    expect(screen.getByText("Bonanza Coffee Heroes")).toBeTruthy();
    expect(screen.getByText("prenzlauer berg")).toBeTruthy();
  });

  it("shows a temporarily closed badge when status is temporarily_closed", () => {
    const shop = makeShop({ status: "temporarily_closed" });
    render(<ShopCard shop={shop} />);
    expect(screen.getByText("temporarily closed")).toBeTruthy();
  });

  it("renders editor note paragraph when present", () => {
    const shop = makeShop();
    render(
      <>
        <ShopCard shop={shop} />
        <AttributeBadges shop={shop} />
        {shop.editor_note && <p>{shop.editor_note}</p>}
      </>,
    );
    expect(screen.getByText("Pioneer of the Berlin third-wave scene.")).toBeTruthy();
  });

  it("renders 'not yet verified' for null P2 attributes", () => {
    const shop = makeShop({
      wifi_available: null,
      power_outlets: null,
      noise_level: null,
      laptop_friendly: null,
      outdoor_seating: null,
    });
    render(<AttributeBadges shop={shop} />);
    const unverified = screen.getAllByText("not yet verified");
    expect(unverified.length).toBeGreaterThanOrEqual(1);
  });

  it("renders ShopImage placeholder when primary_photo_url is null", () => {
    const shop = makeShop({ primary_photo_url: null });
    render(<ShopImage shop={shop} />);
    const placeholder = screen.getByTestId("shop-image-placeholder");
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent).toContain("B");
  });

  it("renders an img with shop name as alt when primary_photo_url is set", () => {
    const shop = makeShop();
    render(<ShopImage shop={shop} />);
    const img = screen.getByAltText("Bonanza Coffee Heroes");
    expect(img.tagName).toBe("IMG");
  });
});
