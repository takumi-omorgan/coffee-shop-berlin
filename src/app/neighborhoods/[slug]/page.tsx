import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighborhood, getNeighborhoods, getShopsByNeighborhood } from "@/lib/data";
import ShopCard from "@/components/ShopCard";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const neighborhoods = await getNeighborhoods();
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = await getNeighborhood(slug);
  if (!neighborhood) return {};

  return {
    title: `${neighborhood.name} cafés`,
    description: `${neighborhood.name} specialty coffee cafés in Berlin — ${neighborhood.intro}`,
    alternates: { canonical: `${SITE.url}/neighborhoods/${neighborhood.slug}` },
  };
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const neighborhood = await getNeighborhood(slug);
  if (!neighborhood) notFound();

  const shops = await getShopsByNeighborhood(slug);

  const pageUrl = `${SITE.url}/neighborhoods/${neighborhood.slug}`;
  const neighborhoodBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: SITE.url },
    { name: "Neighborhoods", url: `${SITE.url}/neighborhoods` },
    { name: neighborhood.name, url: pageUrl },
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd(shops, pageUrl)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(neighborhoodBreadcrumb),
        }}
      />
      <nav className="mb-6 text-sm">
        <Link
          href="/neighborhoods"
          className="text-amber-700 underline hover:text-amber-800"
        >
          ← All neighborhoods
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-amber-700 dark:text-amber-500">
          Neighborhood
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {neighborhood.name} cafés
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
          {neighborhood.intro}
        </p>
      </header>

      {shops.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No cafés listed in this neighborhood yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.slug} shop={shop} />
          ))}
        </div>
      )}
    </main>
  );
}
