import type { Metadata } from "next";
import { Suspense } from "react";
import { getNeighborhoods, getShops } from "@/lib/data";
import BrowseClient from "@/components/BrowseClient";

export const metadata: Metadata = {
  title: "Browse cafés",
};

export default async function BrowsePage() {
  const [shops, neighborhoods] = await Promise.all([
    getShops(),
    getNeighborhoods(),
  ]);
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Browse cafés</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Filter Berlin specialty coffee shops by neighborhood, vibe, and amenities.
        </p>
      </header>
      <Suspense fallback={<p>Loading…</p>}>
        <BrowseClient shops={shops} neighborhoods={neighborhoods} />
      </Suspense>
    </main>
  );
}
