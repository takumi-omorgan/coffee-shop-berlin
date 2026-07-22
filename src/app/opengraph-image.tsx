import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PALETTE = {
  background: "#FFF7ED",
  panel: "#FFFBF3",
  accent: "#B45309",
  accentSoft: "#FCD9A8",
  title: "#1C1917",
  subtitle: "#78716C",
};

export default async function Image() {
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
              marginBottom: 32,
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: PALETTE.subtitle,
              fontWeight: 500,
              lineHeight: 1.35,
              maxWidth: 980,
            }}
          >
            {SITE.description}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
              color: PALETTE.accent,
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
