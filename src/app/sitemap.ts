import type { MetadataRoute } from "next";
import { getNeighborhoods, getShops } from "@/lib/data";
import { qualifyingAttributePages, qualifyingComboPages } from "@/lib/best";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [shops, neighborhoods] = await Promise.all([
    getShops(),
    getNeighborhoods(),
  ]);

  const base = SITE.url;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/browse`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/map`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/neighborhoods`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  for (const shop of shops) {
    entries.push({
      url: `${base}/cafes/${shop.slug}`,
      lastModified: shop.last_verified_at
        ? new Date(shop.last_verified_at)
        : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const neighborhood of neighborhoods) {
    entries.push({
      url: `${base}/neighborhoods/${neighborhood.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const { attribute } of qualifyingAttributePages(shops)) {
    entries.push({
      url: `${base}/best/${attribute.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const { attribute, neighborhood } of qualifyingComboPages(
    shops,
    neighborhoods,
  )) {
    entries.push({
      url: `${base}/best/${attribute.slug}/${neighborhood.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
