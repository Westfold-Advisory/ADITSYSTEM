import { Navigation } from "lucide-react";
import { Capa } from "./Capa";
import { PanelCapas } from "./PanelCapas";
import {
  Map,
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
  const center: [number, number] = selected
    ? [selected.coordinates.longitude, selected.coordinates.latitude]
    : [-98.5, 19.0];
  return (
    <div
      className="h-full min-h-[480px] overflow-hidden border"
      style={{ borderColor: "var(--cyber-border-subtle)" }}
    >
      <Map
        viewport={{ center, zoom: selected ? 13 : 7 }}
        onViewportChange={() => undefined}
      >
        <MapControls />
        <Capa
          items={geofences}
          visible={geofenceVisibility}
          selectedId={selectedGeofenceId}
          onSelect={onSelectGeofence}
        />
        {events.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <MapMarker
              key={event.id}
              longitude={event.coordinates.longitude}
              latitude={event.coordinates.latitude}
            >
              <MarkerContent>
                <button
                  type="button"
                  onClick={() => onSelectEvent(event.id)}
                  aria-label={`Seleccionar ${event.name}`}
                  aria-pressed={isSelected}
                  className="rounded-full border-2"
                  style={{
                    width: isSelected ? 18 : 13,
                    height: isSelected ? 18 : 13,
                    borderColor: "var(--cyber-cyan)",
                    background: isSelected
                      ? "var(--cyber-cyan)"
                      : "var(--cyber-cyan-dim)",
                    boxShadow: "0 0 12px var(--cyber-cyan)",
                  }}
                />
                <MarkerLabel position="bottom">
                  <span
                    className="font-mono text-[9px]"
                    style={{ color: "var(--cyber-cyan)" }}
                  >
                    {event.name}
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
                    {event.type}
                  </p>
                  <h2 className="font-semibold">{event.name}</h2>
                  <p className="text-sm">{event.locationText}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.latitude},${event.coordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm"
                  >
                    <Navigation size={14} /> Cómo llegar
                  </a>
                </article>
              </MarkerPopup>
            </MapMarker>
          );
        })}
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
