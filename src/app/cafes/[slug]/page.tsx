import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopBySlug, getShops } from "@/lib/data";
import AttributeBadges from "@/components/AttributeBadges";
import HoursTable from "@/components/HoursTable";
import MiniMap from "@/components/MiniMap";
import ShopImage from "@/components/ShopImage";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const shops = await getShops();
  return shops.map((shop) => ({ slug: shop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return {};

  const description =
    shop.editor_note ??
    `${shop.name} — a specialty coffee café in ${shop.neighborhood_slug.replace(/-/g, " ")}, Berlin.`;

  return {
    title: shop.name,
    description,
    alternates: {
      canonical: `${SITE.url}/cafes/${shop.slug}`,
    },
  };
}

function humanizedNeighborhood(slug: string): string {
  return slug.replace(/-/g, " ");
}

function verifiedLabel(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `Verified ${month} ${year}`;
}

export default async function CafePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const verified = verifiedLabel(shop.last_verified_at);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article>
        <header className="mb-6">
          <p className="text-sm uppercase tracking-widest text-amber-700 dark:text-amber-500">
            {humanizedNeighborhood(shop.neighborhood_slug)}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {shop.name}
          </h1>
          {shop.price_band && (
            <p className="mt-1 text-zinc-700 dark:text-zinc-300">
              {shop.price_band}
            </p>
          )}
        </header>

        <ShopImage
          shop={shop}
          className="mb-6 h-64 w-full rounded-lg object-cover"
        />

        {shop.editor_note && (
          <p className="mb-6 text-lg leading-7 text-zinc-700 dark:text-zinc-300">
            {shop.editor_note}
          </p>
        )}

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Location</h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            {shop.google_maps_url ? (
              <a
                href={shop.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-700"
              >
                {shop.address_full}
              </a>
            ) : (
              shop.address_full
            )}
          </p>
          {(shop.website_url || shop.instagram_url || shop.phone) && (
            <ul className="mt-2 flex flex-wrap gap-3 text-sm">
              {shop.website_url && (
                <li>
                  <a
                    href={shop.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 underline hover:text-amber-800"
                  >
                    Website
                  </a>
                </li>
              )}
              {shop.instagram_url && (
                <li>
                  <a
                    href={shop.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 underline hover:text-amber-800"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {shop.phone && <li>{shop.phone}</li>}
            </ul>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Attributes</h2>
          <AttributeBadges shop={shop} />
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Opening hours</h2>
          <HoursTable hours={shop.hours} />
        </section>

        {Number.isFinite(shop.latitude) && Number.isFinite(shop.longitude) && (
          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">On the map</h2>
            <MiniMap
              lat={shop.latitude}
              lon={shop.longitude}
              name={shop.name}
            />
          </section>
        )}

        {verified && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{verified}</p>
        )}
      </article>
    </main>
  );
}
