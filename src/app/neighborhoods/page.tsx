import Link from "next/link";
import { getNeighborhoods, getShopsByNeighborhood } from "@/lib/data";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Neighborhoods",
  description: `Browse Berlin specialty coffee cafés by Kiez — ${SITE.name}.`,
  alternates: { canonical: `${SITE.url}/neighborhoods` },
};

export default async function NeighborhoodsPage() {
  const neighborhoods = await getNeighborhoods();

  const withCounts = await Promise.all(
    neighborhoods.map(async (n) => ({
      neighborhood: n,
      count: (await getShopsByNeighborhood(n.slug)).length,
    })),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Neighborhoods</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Browse Berlin specialty coffee cafés by Kiez.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {withCounts.map(({ neighborhood, count }) => (
          <li
            key={neighborhood.slug}
            className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <Link
              href={`/neighborhoods/${neighborhood.slug}`}
              className="block hover:text-amber-700"
            >
              <h2 className="text-xl font-semibold">{neighborhood.name}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {neighborhood.intro}
              </p>
              <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-500">
                {count} {count === 1 ? "café" : "cafés"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
