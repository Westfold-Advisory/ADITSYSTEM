import type { Geofence, GeofenceType } from "@/api/geofences";
import { geofenceMatchesSearch } from "@/lib/geofence-geometry";

export type GeofenceListScope = "ALL" | GeofenceType;

const LIST_PREVIEW_LIMIT = 80;

export function filterGeofencesForPanelList(options: {
  items: Geofence[];
  visible: Record<GeofenceType, boolean>;
  listScope: GeofenceListScope;
  search: string;
}): { items: Geofence[]; totalMatches: number; truncated: boolean } {
  const { items, visible, listScope, search } = options;
  const term = search.trim();

  let pool = items.filter((item) => item.geometry && visible[item.type]);
  if (listScope !== "ALL") {
    pool = pool.filter((item) => item.type === listScope);
  }
  if (term) {
    pool = pool.filter((item) => geofenceMatchesSearch(item, term));
  }

  pool.sort((a, b) =>
    a.name.localeCompare(b.name, "es-MX", { sensitivity: "base" }),
  );

  const totalMatches = pool.length;
  const truncated = !term && totalMatches > LIST_PREVIEW_LIMIT;
  const itemsOut = truncated ? pool.slice(0, LIST_PREVIEW_LIMIT) : pool;

  return { items: itemsOut, totalMatches, truncated };
}
