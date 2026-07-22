import type { CoffeeShop, Neighborhood } from "./types";

export interface BestAttribute {
  slug: string;
  title: string;
  intro: string;
  predicate: (s: CoffeeShop) => boolean;
}

export const BEST_ATTRIBUTES: BestAttribute[] = [
  {
    slug: "laptop-friendly",
    title: "Laptop-friendly cafés in Berlin",
    intro:
      "Cafés where working with a laptop is genuinely welcome — power outlets, Wi-Fi, and a table you can settle at for a few hours.",
    predicate: (s) => s.laptop_friendly === "yes",
  },
  {
    slug: "wifi",
    title: "Cafés with Wi-Fi in Berlin",
    intro:
      "Specialty coffee spots with reliable Wi-Fi, for remote work, video calls, or a quick coffee-and-email break.",
    predicate: (s) => s.wifi_available === true,
  },
  {
    slug: "outdoor-seating",
    title: "Cafés with outdoor seating in Berlin",
    intro:
      "Soak up the Berlin summer — these specialty cafés have outdoor seating, from sidewalk tables to hidden courtyards.",
    predicate: (s) => s.outdoor_seating === true,
  },
  {
    slug: "quiet",
    title: "Quiet cafés in Berlin",
    intro:
      "Low-key, low-volume spots for reading, focused work, or a calm conversation over a flat white.",
    predicate: (s) => s.noise_level === "quiet",
  },
  {
    slug: "filter-coffee",
    title: "Cafés serving filter coffee in Berlin",
    intro:
      "Where the brew bar matters — these cafés pour filter and pour-over coffee alongside their espresso program.",
    predicate: (s) =>
      s.coffee_methods.includes("filter") ||
      s.coffee_methods.includes("pour_over"),
  },
];

const THIN_CONTENT_THRESHOLD = 5;

function activeShops(shops: CoffeeShop[]): CoffeeShop[] {
  return shops.filter((s) => s.status === "active");
}

export function qualifyingAttributePages(
  shops: CoffeeShop[],
): { attribute: BestAttribute; shops: CoffeeShop[] }[] {
  const active = activeShops(shops);
  const out: { attribute: BestAttribute; shops: CoffeeShop[] }[] = [];
  for (const attribute of BEST_ATTRIBUTES) {
    const matches = active.filter((s) => attribute.predicate(s));
    if (matches.length >= THIN_CONTENT_THRESHOLD) {
      out.push({ attribute, shops: matches });
    }
  }
  return out;
}

export function qualifyingComboPages(
  shops: CoffeeShop[],
  hoods: Neighborhood[],
): {
  attribute: BestAttribute;
  neighborhood: Neighborhood;
  shops: CoffeeShop[];
  intro: string;
}[] {
  const active = activeShops(shops);
  const out: {
    attribute: BestAttribute;
    neighborhood: Neighborhood;
    shops: CoffeeShop[];
    intro: string;
  }[] = [];
  for (const attribute of BEST_ATTRIBUTES) {
    for (const neighborhood of hoods) {
      const matches = active.filter(
        (s) =>
          s.neighborhood_slug === neighborhood.slug &&
          attribute.predicate(s),
      );
      if (matches.length >= THIN_CONTENT_THRESHOLD) {
        const intro = `${matches.length} ${attribute.slug} cafés in ${neighborhood.name} — hand-checked picks for ${neighborhood.name}.`;
        out.push({ attribute, neighborhood, shops: matches, intro });
      }
    }
  }
  return out;
}
