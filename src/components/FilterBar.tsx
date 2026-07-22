"use client";

import type { Neighborhood } from "@/lib/types";

export interface FilterBarValue {
  neighborhood: string;
  laptop: boolean;
  wifi: boolean;
  open: boolean;
  vibe: string;
  q: string;
}

export default function FilterBar({
  neighborhoods,
  vibes,
  value,
  onChange,
}: {
  neighborhoods: Neighborhood[];
  vibes: string[];
  value: FilterBarValue;
  onChange: (next: FilterBarValue) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[12rem]">
        <label htmlFor="filter-q" className="sr-only">
          Search cafés
        </label>
        <input
          id="filter-q"
          type="text"
          placeholder="Search cafés…"
          aria-label="Search cafés"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="filter-neighborhood" className="sr-only">
          Neighborhood
        </label>
        <select
          id="filter-neighborhood"
          value={value.neighborhood}
          onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-vibe" className="sr-only">
          Vibe
        </label>
        <select
          id="filter-vibe"
          value={value.vibe}
          onChange={(e) => onChange({ ...value, vibe: e.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Any vibe</option>
          {vibes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.laptop}
          onChange={(e) => onChange({ ...value, laptop: e.target.checked })}
        />
        Laptop-friendly
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.wifi}
          onChange={(e) => onChange({ ...value, wifi: e.target.checked })}
        />
        Wi-Fi
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.open}
          onChange={(e) => onChange({ ...value, open: e.target.checked })}
        />
        Open now
      </label>
    </div>
  );
}
