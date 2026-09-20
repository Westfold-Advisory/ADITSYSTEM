import { useMemo, useState } from "react";
import { Navigation } from "lucide-react";
import { Capa } from "./Capa";
import { PanelCapas } from "./PanelCapas";
import {
  Map,
  MapClusterLayer,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "@/components/ui/map";
import type { Geofence, GeofenceType } from "@/api/geofences";
import type { Event, UUID } from "@/types/events";

export function MapaVista({
  events,
  selectedEventId,
  onSelectEvent,
  panelAbierto,
  onCerrarPanel,
  geofences,
  geofencesLoading,
  geofencesError,
  geofenceVisibility,
  selectedGeofenceId,
  onToggleGeofenceType,
  onSelectGeofence,
  pointGeofences,
  pointLookup,
}: {
  events: Event[];
  selectedEventId: UUID | null;
  onSelectEvent: (id: UUID) => void;
  panelAbierto: boolean;
  onCerrarPanel: () => void;
  geofences: Geofence[];
  geofencesLoading: boolean;
  geofencesError: string | null;
  geofenceVisibility: Record<GeofenceType, boolean>;
  selectedGeofenceId: string | null;
  onToggleGeofenceType: (type: GeofenceType) => void;
  onSelectGeofence: (id: string) => void;
  pointGeofences: Geofence[];
  pointLookup: { loading: boolean; error: string | null };
}) {
  const selected = events.find((event) => event.id === selectedEventId);
  const defaultViewport = {
    center: [-98.5, 19.0] as [number, number],
    zoom: 7,
  };
  const [baseMap, setBaseMap] = useState<"dark" | "light">("dark");
  const [viewport, setViewport] = useState(defaultViewport);
  const center: [number, number] = selected
    ? [selected.coordinates.longitude, selected.coordinates.latitude]
    : viewport.center;
  const eventPoints = useMemo<
    GeoJSON.FeatureCollection<GeoJSON.Point, { id: UUID }>
  >(
    () => ({
      type: "FeatureCollection",
      features: events.map((event) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            event.coordinates.longitude,
            event.coordinates.latitude,
          ],
        },
        properties: { id: event.id },
      })),
    }),
    [events],
  );
  return (
    <div
      className="h-full min-h-[480px] overflow-hidden border"
      style={{ borderColor: "var(--cyber-border-subtle)" }}
    >
      <Map
        theme={baseMap}
        keyboard={false}
        viewport={{ center, zoom: selected ? 13 : viewport.zoom }}
        onViewportChange={setViewport}
      >
        <MapControls
          position="bottom-right"
          onResetView={() => setViewport(defaultViewport)}
          onToggleBaseMap={() =>
            setBaseMap((current) => (current === "dark" ? "light" : "dark"))
          }
        />
        <Capa
          items={geofences}
          visible={geofenceVisibility}
          selectedId={selectedGeofenceId}
          onSelect={onSelectGeofence}
        />
        <MapClusterLayer
          data={eventPoints}
          clusterMaxZoom={13}
          clusterRadius={52}
          pointColor="var(--cyber-cyan)"
          clusterColors={["#168d9a", "#7566d9", "#c77515"]}
          clusterThresholds={[10, 50]}
          onPointClick={(feature) => onSelectEvent(feature.properties.id)}
        />
        {selected && (
          <MapMarker
            longitude={selected.coordinates.longitude}
            latitude={selected.coordinates.latitude}
          >
            <MarkerContent>
              <button
                type="button"
                onClick={() => onSelectEvent(selected.id)}
                aria-label={`Seleccionar ${selected.name}`}
                className="h-[18px] w-[18px] rounded-full border-2"
                style={{
                  borderColor: "var(--cyber-cyan)",
                  background: "var(--cyber-cyan)",
                  boxShadow: "0 0 12px var(--cyber-cyan)",
                }}
              />
              <MarkerLabel position="bottom">
                <span
                  className="text-xs"
                  style={{ color: "var(--md-sys-color-primary)" }}
                >
                  {selected.name}
                </span>
              </MarkerLabel>
            </MarkerContent>
            <MarkerPopup className="p-0">
              <article
                className="w-60 space-y-2 border p-3"
                style={{
                  background: "var(--cyber-surface-2)",
                  borderColor: "var(--cyber-border)",
                }}
              >
                <p className="text-xs" style={{ color: "var(--cyber-cyan)" }}>
                  {selected.type}
                </p>
                <h2 className="font-semibold">{selected.name}</h2>
                <p className="text-sm">{selected.locationText}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates.latitude},${selected.coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm"
                >
                  <Navigation size={14} /> Cómo llegar
                </a>
              </article>
            </MarkerPopup>
          </MapMarker>
        )}
        {panelAbierto && (
          <PanelCapas
            items={geofences}
            visible={geofenceVisibility}
            selectedId={selectedGeofenceId}
            loading={geofencesLoading}
            error={geofencesError}
            onToggle={onToggleGeofenceType}
            onSelect={onSelectGeofence}
            pointGeofences={pointGeofences}
            pointLookup={pointLookup}
            onClose={onCerrarPanel}
          />
        )}
      </Map>
    </div>
  );
}
