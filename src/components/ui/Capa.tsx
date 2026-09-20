import { useEffect } from "react";
import type { FilterSpecification, MapGeoJSONFeature } from "maplibre-gl";
import { useMap } from "@/components/ui/map";
import {
  GEOFENCE_TYPES,
  toGeofenceFeatureCollection,
  type Geofence,
  type GeofenceType,
} from "@/api/geofences";
import { boundsFromGeometry } from "@/lib/geofence-geometry";

const fillColorByType: Record<GeofenceType, string> = {
  ESTADO: "#4DEBFF",
  MUNICIPIO: "#39FF5A",
  DISTRITO: "#FF4DFF",
  SECCION: "#F59E0B",
  DISTRITO_LOCAL: "#A855F7",
  DISTRITO_FEDERAL: "#EC4899",
};

export function Capa({
  items,
  visible,
  selectedId,
  onSelect,
}: {
  items: Geofence[];
  visible: Record<GeofenceType, boolean>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded) return;
    const sourceId = "geocercas-persistidas";
    const data = toGeofenceFeatureCollection(items);
    const source = map.getSource(sourceId) as
      { setData?: (value: typeof data) => void } | undefined;
    if (source?.setData) source.setData(data);
    else map.addSource(sourceId, { type: "geojson", data });
    for (const type of GEOFENCE_TYPES) {
      const fillId = `geocerca-${type}-fill`,
        lineId = `geocerca-${type}-line`;
      if (!map.getLayer(fillId))
        map.addLayer({
          id: fillId,
          type: "fill",
          source: sourceId,
          filter: ["==", ["get", "type"], type],
          paint: {
            "fill-color": fillColorByType[type],
            "fill-opacity": 0.18,
          },
        });
      if (!map.getLayer(lineId))
        map.addLayer({
          id: lineId,
          type: "line",
          source: sourceId,
          filter: ["==", ["get", "type"], type],
          paint: { "line-color": "#ffffff", "line-width": 1.5 },
        });
      map.setLayoutProperty(
        fillId,
        "visibility",
        visible[type] ? "visible" : "none",
      );
      map.setLayoutProperty(
        lineId,
        "visibility",
        visible[type] ? "visible" : "none",
      );
    }

    const highlightFill = "geocerca-selected-fill";
    const highlightLine = "geocerca-selected-line";
    if (!map.getLayer(highlightFill)) {
      map.addLayer({
        id: highlightFill,
        type: "fill",
        source: sourceId,
        filter: ["==", ["get", "id"], ""],
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.32,
        },
      });
      map.addLayer({
        id: highlightLine,
        type: "line",
        source: sourceId,
        filter: ["==", ["get", "id"], ""],
        paint: {
          "line-color": "#ffffff",
          "line-width": 3,
        },
      });
    }

    const click = (event: { features?: MapGeoJSONFeature[] }) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === "string") onSelect(id);
    };
    for (const type of GEOFENCE_TYPES) {
      map.on("click", `geocerca-${type}-fill`, click);
    }
    return () => {
      for (const type of GEOFENCE_TYPES) {
        map.off("click", `geocerca-${type}-fill`, click);
      }
    };
  }, [map, isLoaded, items, visible, onSelect]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const highlightFill = "geocerca-selected-fill";
    const highlightLine = "geocerca-selected-line";
    const filter: FilterSpecification = selectedId
      ? ["==", ["get", "id"], selectedId]
      : ["==", ["get", "id"], ""];
    if (map.getLayer(highlightFill)) {
      map.setFilter(highlightFill, filter);
      map.setFilter(highlightLine, filter);
      map.setLayoutProperty(
        highlightFill,
        "visibility",
        selectedId ? "visible" : "none",
      );
      map.setLayoutProperty(
        highlightLine,
        "visibility",
        selectedId ? "visible" : "none",
      );
    }
  }, [map, isLoaded, selectedId]);

  useEffect(() => {
    if (!map || !isLoaded || !selectedId) return;
    const item = items.find((entry) => entry.id === selectedId);
    const bounds = boundsFromGeometry(item?.geometry ?? null);
    if (!bounds) return;
    map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 500 });
  }, [map, isLoaded, items, selectedId]);

  return null;
}
