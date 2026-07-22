import type { Metadata } from "next";
import { getShops } from "@/lib/data";
import { shopsToPins } from "@/lib/map";
import MapView from "@/components/MapView";

export const metadata: Metadata = {
  title: "Map",
};

export default async function MapPage() {
  const shops = await getShops();
  const pins = shopsToPins(shops);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Map</h1>
      <MapView pins={pins} />
    </main>
  );
}
