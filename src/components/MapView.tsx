"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { MapPin } from "@/lib/map";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const BERLIN_CENTER: [number, number] = [13.405, 52.52];

export default function MapView({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: import("maplibre-gl").Map | null = null;
    let disposed = false;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (disposed) return;

      map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: BERLIN_CENTER,
        zoom: 12,
      });

      for (const pin of pins) {
        const popup = new maplibregl.Popup().setHTML(
          `<a href="/cafes/${pin.slug}">${pin.name}</a>`,
        );
        new maplibregl.Marker()
          .setLngLat([pin.lon, pin.lat])
          .setPopup(popup)
          .addTo(map);
      }
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
    };
  }, [pins]);

  return <div ref={containerRef} className="h-[70vh] w-full" />;
}
