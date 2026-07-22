import Link from "next/link";
import type { CoffeeShop } from "@/lib/types";
import ShopImage from "./ShopImage";

function humanize(slug: string): string {
  return slug.replace(/-/g, " ");
}

export default function ShopCard({ shop }: { shop: CoffeeShop }) {
  return (
    <Link
      href={`/cafes/${shop.slug}`}
      className="block rounded-lg border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
    >
      <ShopImage
        shop={shop}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {shop.name}
          </h3>
          {shop.status === "temporarily_closed" && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              temporarily closed
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {humanize(shop.neighborhood_slug)}
        </p>
        {shop.price_band && (
          <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {shop.price_band}
          </p>
        )}
        {shop.vibe_tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {shop.vibe_tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
