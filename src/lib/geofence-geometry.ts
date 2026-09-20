import type { Geometry } from "geojson";

export type LngLatBounds = [[number, number], [number, number]];

/** Web Mercator bbox as MapLibre fitBounds expects: [[west, south], [east, north]]. */
export function boundsFromGeometry(
  geometry: Geometry | null,
): LngLatBounds | null {
  if (!geometry) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const visit = (value: unknown): void => {
    if (
      Array.isArray(value) &&
      value.length >= 2 &&
      typeof value[0] === "number"
    ) {
      const lng = value[0];
      const lat = value[1];
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
  };

  if (geometry.type === "GeometryCollection") {
    for (const part of geometry.geometries) visit(part);
  } else {
    visit(geometry.coordinates);
  }
  if (!Number.isFinite(minLng)) return null;
  if (minLng === maxLng && minLat === maxLat) {
    const pad = 0.02;
    return [
      [minLng - pad, minLat - pad],
      [maxLng + pad, maxLat + pad],
    ];
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function normalizeGeofenceSearchTerm(term: string): string {
  return term.trim().toLocaleLowerCase("es-MX");
}

export function geofenceMatchesSearch(
  item: { name: string; code: string | null; type: string },
  term: string,
): boolean {
  const normalized = normalizeGeofenceSearchTerm(term);
  if (!normalized) return true;
  const haystack =
    `${item.name} ${item.code ?? ""} ${item.type}`.toLocaleLowerCase("es-MX");
  return haystack.includes(normalized);
}
