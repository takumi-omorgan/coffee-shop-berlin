import { slugify } from "./slug";

export function pointInPolygon(pt: [number, number], polygon: number[][][]): boolean {
  if (!Array.isArray(polygon) || polygon.length === 0) return false;
  const inOuter = rayCast(pt, polygon[0]);
  if (!inOuter) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (rayCast(pt, polygon[i])) return false;
  }
  return true;
}

function rayCast(pt: [number, number], ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  if (n < 3) return false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

interface GeoJSONFeature {
  properties?: { name?: unknown };
  geometry?: { type?: unknown; coordinates?: unknown };
}

function polygonContains(pt: [number, number], coords: unknown): boolean {
  if (!Array.isArray(coords)) return false;
  return pointInPolygon(pt, coords as number[][][]);
}

function multiPolygonContains(pt: [number, number], coords: unknown): boolean {
  if (!Array.isArray(coords)) return false;
  for (const poly of coords) {
    if (polygonContains(pt, poly)) return true;
  }
  return false;
}

export function assignNeighborhood(
  lat: number,
  lon: number,
  geojson: unknown,
): string | null {
  if (!geojson || typeof geojson !== "object") return null;
  const features = (geojson as { features?: unknown }).features;
  if (!Array.isArray(features)) return null;
  const pt: [number, number] = [lon, lat];
  for (const feature of features) {
    if (!feature || typeof feature !== "object") continue;
    const f = feature as GeoJSONFeature;
    const name = f.properties?.name;
    if (typeof name !== "string" || name.length === 0) continue;
    const geom = f.geometry;
    if (!geom || typeof geom !== "object") continue;
    const type = geom.type;
    const coords = geom.coordinates;
    let contained = false;
    if (type === "Polygon") {
      contained = polygonContains(pt, coords);
    } else if (type === "MultiPolygon") {
      contained = multiPolygonContains(pt, coords);
    }
    if (contained) return slugify(name);
  }
  return null;
}
