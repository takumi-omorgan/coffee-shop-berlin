import Link from "next/link";
import { SITE } from "@/lib/site";
import {
  getNeighborhoods,
  getShops,
  getShopsByNeighborhood,
} from "@/lib/data";
import ShopCard from "@/components/ShopCard";

export default async function Home() {
  const [shops, neighborhoods] = await Promise.all([
    getShops(),
    getNeighborhoods(),
  ]);

  const featured = [...shops]
    .filter((s) => s.last_verified_at !== null)
    .sort((a, b) =>
      (b.last_verified_at as string).localeCompare(a.last_verified_at as string),
    )
    .slice(0, 4);

  const withCounts = await Promise.all(
    neighborhoods.map(async (n) => ({
      neighborhood: n,
      count: (await getShopsByNeighborhood(n.slug)).length,
    })),
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-700 dark:text-amber-500">
          Berlin · Specialty Coffee
        </p>
        <h1 className="mt-4 max-w-2xl mx-auto text-4xl font-semibold tracking-tight sm:text-5xl">
          {SITE.name}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {SITE.description}
        </p>
        <form
          action="/browse"
          className="mt-8 mx-auto flex max-w-md gap-2"
        >
          <input
            type="text"
            name="q"
            aria-label="Search cafés"
            placeholder="Search cafés…"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Link
            href="/browse"
            className="text-sm text-amber-700 hover:underline dark:text-amber-500"
          >
            Browse all →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((shop) => (
            <ShopCard key={shop.slug} shop={shop} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Browse by neighborhood
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withCounts.map(({ neighborhood, count }) => (
            <Link
              key={neighborhood.slug}
              href={`/neighborhoods/${neighborhood.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:shadow-md dark:border-zinc-800"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {neighborhood.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {count} {count === 1 ? "café" : "cafés"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-16 flex flex-wrap gap-4 text-sm">
        <Link
          href="/browse"
          className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Browse all cafés
        </Link>
        <Link
          href="/neighborhoods"
          className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          All neighborhoods
        </Link>
      </div>
    </main>
  );
}
