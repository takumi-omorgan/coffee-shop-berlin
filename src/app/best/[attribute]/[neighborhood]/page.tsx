import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighborhoods, getShops } from "@/lib/data";
import {
  BEST_ATTRIBUTES,
  qualifyingComboPages,
} from "@/lib/best";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import ShopCard from "@/components/ShopCard";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const [shops, neighborhoods] = await Promise.all([
    getShops(),
    getNeighborhoods(),
  ]);
  return qualifyingComboPages(shops, neighborhoods).map(
    ({ attribute, neighborhood }) => ({
      attribute: attribute.slug,
      neighborhood: neighborhood.slug,
    }),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ attribute: string; neighborhood: string }>;
}): Promise<Metadata> {
  const { attribute: aSlug, neighborhood: nSlug } = await params;
  const attribute = BEST_ATTRIBUTES.find((a) => a.slug === aSlug);
  if (!attribute) return {};
  const neighborhoods = await getNeighborhoods();
  const neighborhood = neighborhoods.find((n) => n.slug === nSlug);
  if (!neighborhood) return {};
  return {
    title: `${attribute.title} — ${neighborhood.name}`,
    description: `${attribute.intro}`,
    alternates: {
      canonical: `${SITE.url}/best/${attribute.slug}/${neighborhood.slug}`,
    },
  };
}

export default async function BestComboPage({
  params,
}: {
  params: Promise<{ attribute: string; neighborhood: string }>;
}) {
  const { attribute: aSlug, neighborhood: nSlug } = await params;
  const [shops, neighborhoods] = await Promise.all([
    getShops(),
    getNeighborhoods(),
  ]);
  const combos = qualifyingComboPages(shops, neighborhoods);
  const combo = combos.find(
    (c) => c.attribute.slug === aSlug && c.neighborhood.slug === nSlug,
  );
  if (!combo) notFound();

  const { attribute, neighborhood, shops: matches, intro } = combo;
  const pageUrl = `${SITE.url}/best/${attribute.slug}/${neighborhood.slug}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: SITE.url },
    { name: "Best", url: `${SITE.url}/best` },
    {
      name: attribute.title,
      url: `${SITE.url}/best/${attribute.slug}`,
    },
    { name: neighborhood.name, url: pageUrl },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd(matches, pageUrl)),
        }}
      />

      <nav className="mb-6 text-sm">
        <Link
          href={`/best/${attribute.slug}`}
          className="text-amber-700 underline hover:text-amber-800"
        >
          ← {attribute.title}
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-amber-700 dark:text-amber-500">
          {neighborhood.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {attribute.title} — {neighborhood.name}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
          {intro}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((shop) => (
          <ShopCard key={shop.slug} shop={shop} />
        ))}
      </div>
    </main>
  );
}
