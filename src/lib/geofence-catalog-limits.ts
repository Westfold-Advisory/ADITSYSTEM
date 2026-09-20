import type { GeofenceType } from "@/api/geofences";

/** Dev API returns 500 above ~100 rows for SECCION (payload size). */
export const DEFAULT_GEOFENCE_PAGE_SIZE = 100;

export interface GeofenceCatalogLimits {
  pageSize: number;
  /** Stop pagination after this many features (dense layers). */
  maxItems: number | null;
  mapHint?: string;
}

export const GEOFENCE_CATALOG_LIMITS: Partial<
  Record<GeofenceType, GeofenceCatalogLimits>
> = {
  SECCION: {
    pageSize: 50,
    maxItems: 250,
    mapHint:
      "Capa muy densa: en el mapa se cargan hasta 250 secciones. Usa el listado y la búsqueda para centrar una sección.",
  },
};

export function catalogLimitsFor(type?: GeofenceType): GeofenceCatalogLimits {
  if (type && GEOFENCE_CATALOG_LIMITS[type]) {
    return GEOFENCE_CATALOG_LIMITS[type]!;
  }
  return { pageSize: DEFAULT_GEOFENCE_PAGE_SIZE, maxItems: null };
}
