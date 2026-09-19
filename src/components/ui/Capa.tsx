import { useEffect } from "react";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useMap } from "@/components/ui/map";
import { toGeofenceFeatureCollection, type Geofence, type GeofenceType } from "@/api/geofences";

export function Capa({ items, visible, selectedId, onSelect }: {
  items: Geofence[]; visible: Record<GeofenceType, boolean>; selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded) return;
    const sourceId = "geocercas-persistidas";
    const data = toGeofenceFeatureCollection(items);
    const source = map.getSource(sourceId) as { setData?: (value: typeof data) => void } | undefined;
    if (source?.setData) source.setData(data); else map.addSource(sourceId, { type: "geojson", data });
    for (const type of ["ESTADO", "MUNICIPIO", "DISTRITO"] as GeofenceType[]) {
      const fillId = `geocerca-${type}-fill`, lineId = `geocerca-${type}-line`;
      if (!map.getLayer(fillId)) map.addLayer({ id: fillId, type: "fill", source: sourceId, filter: ["==", ["get", "type"], type], paint: { "fill-color": type === "ESTADO" ? "#4DEBFF" : type === "MUNICIPIO" ? "#39FF5A" : "#FF4DFF", "fill-opacity": 0.18 } });
      if (!map.getLayer(lineId)) map.addLayer({ id: lineId, type: "line", source: sourceId, filter: ["==", ["get", "type"], type], paint: { "line-color": "#ffffff", "line-width": 1.5 } });
      map.setLayoutProperty(fillId, "visibility", visible[type] ? "visible" : "none");
      map.setLayoutProperty(lineId, "visibility", visible[type] ? "visible" : "none");
    }
    const click = (event: { features?: MapGeoJSONFeature[] }) => { const id = event.features?.[0]?.properties?.id; if (typeof id === "string") onSelect(id); };
    map.on("click", "geocerca-ESTADO-fill", click); map.on("click", "geocerca-MUNICIPIO-fill", click); map.on("click", "geocerca-DISTRITO-fill", click);
    return () => { map.off("click", "geocerca-ESTADO-fill", click); map.off("click", "geocerca-MUNICIPIO-fill", click); map.off("click", "geocerca-DISTRITO-fill", click); };
  }, [map, isLoaded, items, visible, onSelect]);
  useEffect(() => {
    if (!map || !selectedId) return; const item = items.find((entry) => entry.id === selectedId);
    const coordinates = item?.geometry && "coordinates" in item.geometry ? item.geometry.coordinates : undefined; if (!coordinates) return;
    const points: number[][] = []; const visit = (v: unknown): void => { if (Array.isArray(v) && typeof v[0] === "number") { points.push(v as number[]); return; } if (Array.isArray(v)) v.forEach(visit); }; visit(coordinates);
    if (points.length) map.fitBounds(points.reduce((bounds, point) => bounds.extend(point as [number, number]), map.getBounds()), { padding: 64, maxZoom: 12, duration: 500 });
  }, [map, items, selectedId]);
  return null;
}
