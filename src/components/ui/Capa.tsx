// src/components/Capa.tsx
import { useEffect, useState } from "react";
import { useMap } from "@/components/ui/map";

interface CapaProps {
  visibleOaxaca: boolean;
  visiblePuebla: boolean;
}

export function Capa({ visibleOaxaca, visiblePuebla }: CapaProps) {
  const { map, isLoaded } = useMap();
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!map || !isLoaded) return;

    fetch(
      "https://raw.githubusercontent.com/strotgen/mexico-leaflet/master/states.geojson",
    )
      .then((r) => r.json())
      .then((data) => {
        const filtered = {
          type: "FeatureCollection",
          features: data.features.filter((f: any) =>
            ["Oaxaca", "Puebla"].includes(f.properties?.state_name || ""),
          ),
        };

        if (map.getSource("estados")) return;

        map.addSource("estados", { type: "geojson", data: filtered });

        map.addLayer({
          id: "oaxaca-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Oaxaca"],
          paint: { "fill-color": "#ff6b35", "fill-opacity": 0.15 },
        });
        map.addLayer({
          id: "oaxaca-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Oaxaca"],
          paint: {
            "line-color": "#ff6b35",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "puebla-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Puebla"],
          paint: { "fill-color": "#f01ab3", "fill-opacity": 0.12 },
        });
        map.addLayer({
          id: "puebla-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Puebla"],
          paint: {
            "line-color": "#ff14c0",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        setCargado(true);
      });
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "oaxaca-fill",
      "visibility",
      visibleOaxaca ? "visible" : "none",
    );
    map.setLayoutProperty(
      "oaxaca-outline",
      "visibility",
      visibleOaxaca ? "visible" : "none",
    );
  }, [map, cargado, visibleOaxaca]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "puebla-fill",
      "visibility",
      visiblePuebla ? "visible" : "none",
    );
    map.setLayoutProperty(
      "puebla-outline",
      "visibility",
      visiblePuebla ? "visible" : "none",
    );
  }, [map, cargado, visiblePuebla]);

  return null;
}
