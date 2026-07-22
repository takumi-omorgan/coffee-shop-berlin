import { ImageResponse } from "next/og";
import { getShopBySlug, getShops } from "@/lib/data";
import { ogTitle } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const shops = await getShops();
  return shops.map((shop) => ({ slug: shop.slug }));
}

const PALETTE = {
  background: "#FFF7ED",
  panel: "#FFFBF3",
  accent: "#B45309",
  accentSoft: "#FCD9A8",
  title: "#1C1917",
  subtitle: "#78716C",
};

function humanize(slug: string): string {
  return slug.replace(/-/g, " ");
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 96,
            backgroundColor: PALETTE.background,
            backgroundImage: `linear-gradient(135deg, ${PALETTE.panel} 0%, ${PALETTE.background} 100%)`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                textTransform: "uppercase",
                fontSize: 30,
                letterSpacing: 8,
                color: PALETTE.accent,
                fontWeight: 600,
                marginBottom: 32,
              }}
            >
              Berlin Specialty Coffee
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 700,
                color: PALETTE.title,
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              {SITE.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: PALETTE.subtitle,
              fontWeight: 500,
            }}
          >
            {SITE.description}
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const title = ogTitle(shop);
  const neighborhood = humanize(shop.neighborhood_slug);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 96,
          backgroundColor: PALETTE.background,
          backgroundImage: `linear-gradient(135deg, ${PALETTE.panel} 0%, ${PALETTE.background} 100%)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: PALETTE.accent,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            {neighborhood}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              color: PALETTE.title,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 6,
              backgroundColor: PALETTE.accentSoft,
              marginRight: 24,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: PALETTE.subtitle,
              fontWeight: 600,
            }}
          >
            {SITE.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
