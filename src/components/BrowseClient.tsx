"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CoffeeShop, Neighborhood } from "@/lib/types";
import { filterShops, type ShopFilters } from "@/lib/filter";
import FilterBar, { type FilterBarValue } from "./FilterBar";
import ShopCard from "./ShopCard";

export default function BrowseClient({
  shops,
  neighborhoods,
}: {
  shops: CoffeeShop[];
  neighborhoods: Neighborhood[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value: FilterBarValue = {
    neighborhood: searchParams.get("neighborhood") ?? "",
    laptop: searchParams.get("laptop") === "1",
    wifi: searchParams.get("wifi") === "1",
    open: searchParams.get("open") === "1",
    vibe: searchParams.get("vibe") ?? "",
    q: searchParams.get("q") ?? "",
  };

  const vibes = useMemo(() => {
    const set = new Set<string>();
    for (const s of shops) for (const v of s.vibe_tags) set.add(v);
    return Array.from(set).sort();
  }, [shops]);

  const filters: ShopFilters = {
    neighborhood: value.neighborhood || undefined,
    laptopFriendly: value.laptop ? true : undefined,
    wifi: value.wifi ? true : undefined,
    openAt: value.open ? new Date() : undefined,
    vibe: value.vibe || undefined,
    query: value.q || undefined,
  };

  const filtered = filterShops(shops, filters);

  function handleChange(next: FilterBarValue) {
    const params = new URLSearchParams(searchParams.toString());
    const update = (key: string, val: string) => {
      if (val) params.set(key, val);
      else params.delete(key);
    };
    update("neighborhood", next.neighborhood);
    update("vibe", next.vibe);
    update("q", next.q);
    if (next.laptop) params.set("laptop", "1");
    else params.delete("laptop");
    if (next.wifi) params.set("wifi", "1");
    else params.delete("wifi");
    if (next.open) params.set("open", "1");
    else params.delete("open");
    const qs = params.toString();
    router.replace(qs ? `/browse?${qs}` : "/browse");
  }

  return (
    <div>
      <FilterBar
        neighborhoods={neighborhoods}
        vibes={vibes}
        value={value}
        onChange={handleChange}
      />
      {filtered.length === 0 ? (
        <p>No cafés match your filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop) => (
            <ShopCard key={shop.slug} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
