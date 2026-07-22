import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShops } from "@/lib/data";
import {
  BEST_ATTRIBUTES,
  qualifyingAttributePages,
} from "@/lib/best";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import ShopCard from "@/components/ShopCard";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const shops = await getShops();
  return qualifyingAttributePages(shops).map(({ attribute }) => ({
    attribute: attribute.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ attribute: string }>;
}): Promise<Metadata> {
  const { attribute: slug } = await params;
  const attribute = BEST_ATTRIBUTES.find((a) => a.slug === slug);
  if (!attribute) return {};
  return {
    title: attribute.title,
    description: attribute.intro,
    alternates: { canonical: `${SITE.url}/best/${attribute.slug}` },
  };
}

export default async function BestAttributePage({
  params,
}: {
  params: Promise<{ attribute: string }>;
}) {
  const { attribute: slug } = await params;
  const shops = await getShops();
  const pages = qualifyingAttributePages(shops);
  const page = pages.find((p) => p.attribute.slug === slug);
  if (!page) notFound();

  const { attribute, shops: matches } = page;
  const pageUrl = `${SITE.url}/best/${attribute.slug}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: SITE.url },
    { name: "Best", url: `${SITE.url}/best` },
    { name: attribute.title, url: pageUrl },
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
          href="/"
          className="text-amber-700 underline hover:text-amber-800"
        >
          ← Home
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-amber-700 dark:text-amber-500">
          Best of Berlin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {attribute.title}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
          {attribute.intro}
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
