"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export default function MiniMap({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
  name: string;
}) {
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
        center: [lon, lat],
        zoom: 15,
      });

      new maplibregl.Marker().setLngLat([lon, lat]).addTo(map);
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
    };
  }, [lat, lon]);

  return <div ref={containerRef} className="h-64 w-full rounded-lg" />;
}
