import type { CoffeeShop } from "@/lib/types";

interface Badge {
  label: string;
  value: string;
}

function p2Badges(shop: CoffeeShop): Badge[] {
  const badges: Badge[] = [];

  badges.push({
    label: "Wi-Fi",
    value:
      shop.wifi_available === null
        ? "not yet verified"
        : shop.wifi_available
          ? "yes"
          : "no",
  });

  badges.push({
    label: "Power outlets",
    value: shop.power_outlets === null ? "not yet verified" : shop.power_outlets,
  });

  badges.push({
    label: "Noise level",
    value: shop.noise_level === null ? "not yet verified" : shop.noise_level,
  });

  badges.push({
    label: "Laptop friendly",
    value:
      shop.laptop_friendly === null ? "not yet verified" : shop.laptop_friendly,
  });

  badges.push({
    label: "Outdoor seating",
    value:
      shop.outdoor_seating === null
        ? "not yet verified"
        : shop.outdoor_seating
          ? "yes"
          : "no",
  });

  return badges;
}

export default function AttributeBadges({ shop }: { shop: CoffeeShop }) {
  const badges = p2Badges(shop);

  return (
    <div className="space-y-3">
      {shop.specialty_coffee && (
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          specialty coffee
        </span>
      )}

      <ul className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <li
            key={badge.label}
            className="rounded-md border border-zinc-200 px-3 py-1 text-sm dark:border-zinc-800"
          >
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {badge.label}:
            </span>{" "}
            <span className="text-zinc-600 dark:text-zinc-400">
              {badge.value}
            </span>
          </li>
        ))}
      </ul>

      {shop.coffee_methods.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {shop.coffee_methods.map((method) => (
            <li
              key={method}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {method}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
