// src/components/Capa.tsx
import { useEffect, useState } from "react";
import { useMap } from "@/components/ui/map";

interface CapaProps {
  visibleDistritoLocal01: boolean;
  visibleDistritoLocal02: boolean;
  visibleDistritoLocal05: boolean;
  visibleDistritoLocal06: boolean;
  visibleDistritoLocal07: boolean;
  visibleDistritoLocal08: boolean;
  visibleDistritoLocal09: boolean;
  visibleDistritoLocal10: boolean;
  visibleDistritoLocal11: boolean;
  visibleDistritoLocal12: boolean;
  visibleDistritoLocal13: boolean;
  visibleDistritoLocal14: boolean;
  visibleDistritoLocal15: boolean;
  visibleDistritoLocal16: boolean;
  visibleDistritoLocal17: boolean;
  visibleDistritoLocal18: boolean;
  visibleDistritoLocal19: boolean;
  visibleDistritoLocal20: boolean;
  visibleDistritoLocal21: boolean;
  visibleDistritoLocal22: boolean;
  visibleDistritoLocal23: boolean;
  visibleDistritoLocal24: boolean;
  visibleDistritoLocal25: boolean;
  visibleDistritoLocal26: boolean;

  visibleOaxaca: boolean;
  visiblePuebla: boolean;
}

interface EstadoFeature {
  properties?: {
    state_name?: string;
  };
}

export function Capa({
  visibleDistritoLocal01,
  visibleDistritoLocal02,
  visibleDistritoLocal05,
  visibleDistritoLocal06,
  visibleDistritoLocal07,
  visibleDistritoLocal08,
  visibleDistritoLocal09,
  visibleDistritoLocal10,
  visibleDistritoLocal11,
  visibleDistritoLocal12,
  visibleDistritoLocal13,
  visibleDistritoLocal14,
  visibleDistritoLocal15,
  visibleDistritoLocal16,
  visibleDistritoLocal17,
  visibleDistritoLocal18,
  visibleDistritoLocal19,
  visibleDistritoLocal20,
  visibleDistritoLocal21,
  visibleDistritoLocal22,
  visibleDistritoLocal23,
  visibleDistritoLocal24,
  visibleDistritoLocal25,
  visibleDistritoLocal26,

  visibleOaxaca,
  visiblePuebla,
}: CapaProps) {
  const { map, isLoaded } = useMap();
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!map || !isLoaded) return;

    fetch(
      "https://raw.githubusercontent.com/Arcoexplsoivo1/data_dtlc/refs/heads/main/dtlcpue.geojson",
    )
      .then((r) => r.json())
      .then((data) => {
        const filtered = {
          type: "FeatureCollection",
          features: data.features.filter((f: EstadoFeature) =>
            [
              "Oaxaca",
              "Puebla",
              "DL1",
              "DL2",
              "DL5",
              "DL6",
              "DL7",
              "DL8",
              "DL9",
              "DL10",
              "DL11",
              "DL12",
              "DL13",
              "DL14",
              "DL15",
              "DL16",
              "DL17",
              "DL18",
              "DL19",
              "DL20",
              "DL21",
              "DL22",
              "DL23",
              "DL24",
              "DL25",
              "DL26",
            ].includes(f.properties?.state_name || ""),
          ),
        } as const;

        if (map.getSource("estados")) return;

        map.addSource("estados", { type: "geojson", data: filtered });

        map.addLayer({
          id: "oaxaca-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Oaxaca"],
          paint: { "fill-color": "#4DEBFF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "oaxaca-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Oaxaca"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "puebla-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Puebla"],
          paint: { "fill-color": "#39FF5A", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "puebla-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "Puebla"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal1-fill",
          type: "fill",

          source: "estados",
          filter: ["==", ["get", "state_name"], "DL1"],
          paint: { "fill-color": "#FF4DFF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal1-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL1"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal2-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL2"],
          paint: { "fill-color": "#6A5CFF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal2-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL2"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal5-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL5"],
          paint: { "fill-color": "#FFFF33", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal5-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL5"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal6-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL6"],
          paint: { "fill-color": "#33B5FF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal6-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL6"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal7-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL7"],
          paint: { "fill-color": "#EFFF00", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal7-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL7"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal8-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL8"],
          paint: { "fill-color": "#FF6B6B", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal8-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL8"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal9-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL9"],
          paint: { "fill-color": "#A8FF00", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal9-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL9"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal10-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL10"],
          paint: { "fill-color": "#E5FF4D", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal10-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL10"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal11-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL11"],
          paint: { "fill-color": "#B266FF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal11-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL11"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal12-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL12"],
          paint: { "fill-color": "#FF8A33", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal12-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL12"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal13-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL13"],
          paint: { "fill-color": "#FFD166", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal13-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL13"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal14-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL14"],
          paint: { "fill-color": "#5B7CFF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal14-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL14"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal15-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL15"],
          paint: { "fill-color": "#4DFF88", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal15-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL15"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal16-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL16"],
          paint: { "fill-color": "#FFB347", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal16-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL16"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal17-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL17"],
          paint: { "fill-color": "#5EC8FF", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal17-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL17"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal18-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL18"],
          paint: { "fill-color": "#4DFFF3", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal18-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL18"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal19-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL19"],
          paint: { "fill-color": "#FF5FA2", "fill-opacity": 0.2 },
        });
        map.addLayer({
          id: "distritolocal19-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL19"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });
        map.addLayer({
          id: "distritolocal20-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL20"],
          paint: { "fill-color": "#33FF99", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal20-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL20"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal21-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL21"],
          paint: { "fill-color": "#FF66F7", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal21-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL21"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal22-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL22"],
          paint: { "fill-color": "#33FFF5", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal22-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL22"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal23-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL23"],
          paint: { "fill-color": "#CFFF3D", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal23-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL23"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal24-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL24"],
          paint: { "fill-color": "#9B7BFF", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal24-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL24"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal25-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL25"],
          paint: { "fill-color": "#FF66CC", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal25-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL25"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-dasharray": [4, 2],
          },
        });

        map.addLayer({
          id: "distritolocal26-fill",
          type: "fill",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL26"],
          paint: { "fill-color": "#FFE84D", "fill-opacity": 0.2 },
        });

        map.addLayer({
          id: "distritolocal26-outline",
          type: "line",
          source: "estados",
          filter: ["==", ["get", "state_name"], "DL26"],
          paint: {
            "line-color": "#ffffff",
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
      "distritolocal1-fill",
      "visibility",
      visibleDistritoLocal01 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal1-outline",
      "visibility",
      visibleDistritoLocal01 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal01]);
  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal2-fill",
      "visibility",
      visibleDistritoLocal02 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal2-outline",
      "visibility",
      visibleDistritoLocal02 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal02]);
  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal5-fill",
      "visibility",
      visibleDistritoLocal05 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal5-outline",
      "visibility",
      visibleDistritoLocal05 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal05]);
  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal6-fill",
      "visibility",
      visibleDistritoLocal06 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal6-outline",
      "visibility",
      visibleDistritoLocal06 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal06]);
  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal7-fill",
      "visibility",
      visibleDistritoLocal07 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal7-outline",
      "visibility",
      visibleDistritoLocal07 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal07]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal8-fill",
      "visibility",
      visibleDistritoLocal08 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal8-outline",
      "visibility",
      visibleDistritoLocal08 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal08]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal9-fill",
      "visibility",
      visibleDistritoLocal09 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal9-outline",
      "visibility",
      visibleDistritoLocal09 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal09]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal10-fill",
      "visibility",
      visibleDistritoLocal10 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal10-outline",
      "visibility",
      visibleDistritoLocal10 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal10]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal11-fill",
      "visibility",
      visibleDistritoLocal11 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal11-outline",
      "visibility",
      visibleDistritoLocal11 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal11]);

  useEffect(() => {
    if (!map || !cargado) return;
    map.setLayoutProperty(
      "distritolocal12-fill",
      "visibility",
      visibleDistritoLocal12 ? "visible" : "none",
    );
    map.setLayoutProperty(
      "distritolocal12-outline",
      "visibility",
      visibleDistritoLocal12 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal12]);

  // DISTRITO LOCAL 13
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal13-fill",
      "visibility",
      visibleDistritoLocal13 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal13-outline",
      "visibility",
      visibleDistritoLocal13 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal13]);

  // DISTRITO LOCAL 14
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal14-fill",
      "visibility",
      visibleDistritoLocal14 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal14-outline",
      "visibility",
      visibleDistritoLocal14 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal14]);

  // DISTRITO LOCAL 15
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal15-fill",
      "visibility",
      visibleDistritoLocal15 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal15-outline",
      "visibility",
      visibleDistritoLocal15 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal15]);

  // DISTRITO LOCAL 16
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal16-fill",
      "visibility",
      visibleDistritoLocal16 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal16-outline",
      "visibility",
      visibleDistritoLocal16 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal16]);

  // DISTRITO LOCAL 17
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal17-fill",
      "visibility",
      visibleDistritoLocal17 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal17-outline",
      "visibility",
      visibleDistritoLocal17 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal17]);

  // DISTRITO LOCAL 18
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal18-fill",
      "visibility",
      visibleDistritoLocal18 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal18-outline",
      "visibility",
      visibleDistritoLocal18 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal18]);

  // DISTRITO LOCAL 19
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal19-fill",
      "visibility",
      visibleDistritoLocal19 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal19-outline",
      "visibility",
      visibleDistritoLocal19 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal19]);

  // DISTRITO LOCAL 20
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal20-fill",
      "visibility",
      visibleDistritoLocal20 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal20-outline",
      "visibility",
      visibleDistritoLocal20 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal20]);

  // DISTRITO LOCAL 21
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal21-fill",
      "visibility",
      visibleDistritoLocal21 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal21-outline",
      "visibility",
      visibleDistritoLocal21 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal21]);

  // DISTRITO LOCAL 22
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal22-fill",
      "visibility",
      visibleDistritoLocal22 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal22-outline",
      "visibility",
      visibleDistritoLocal22 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal22]);

  // DISTRITO LOCAL 23
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal23-fill",
      "visibility",
      visibleDistritoLocal23 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal23-outline",
      "visibility",
      visibleDistritoLocal23 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal23]);

  // DISTRITO LOCAL 24
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal24-fill",
      "visibility",
      visibleDistritoLocal24 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal24-outline",
      "visibility",
      visibleDistritoLocal24 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal24]);

  // DISTRITO LOCAL 25
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal25-fill",
      "visibility",
      visibleDistritoLocal25 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal25-outline",
      "visibility",
      visibleDistritoLocal25 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal25]);

  // DISTRITO LOCAL 26
  useEffect(() => {
    if (!map || !cargado) return;

    map.setLayoutProperty(
      "distritolocal26-fill",
      "visibility",
      visibleDistritoLocal26 ? "visible" : "none",
    );

    map.setLayoutProperty(
      "distritolocal26-outline",
      "visibility",
      visibleDistritoLocal26 ? "visible" : "none",
    );
  }, [map, cargado, visibleDistritoLocal26]);

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
