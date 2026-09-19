import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, PanelLeft, PanelLeftClose, RotateCw } from "lucide-react";

import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import { MapaVista } from "@/components/ui/MapaVista";
import { filterMapEvents } from "@/lib/map-events";
import {
  getMobileMapSheetState,
  initialGeofenceVisibility,
} from "@/lib/map-explorer";
import { isPublishedEvent } from "@/lib/public-events";
import { cn } from "@/lib/utils";
import type { Event, UUID } from "@/types/events";
import {
  GeofencesApi,
  type Geofence,
  type GeofenceType,
} from "@/api/geofences";

const eventsApi = new EventsApi(new ApiClient());

type DateFilter = "all" | "today" | "week";
type RequestState = "loading" | "success" | "error";

function messageFor(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No fue posible cargar los eventos públicos.";
}

export function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [requestState, setRequestState] = useState<RequestState>("loading");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [selectedEventId, setSelectedEventId] = useState<UUID | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [geofencesLoading, setGeofencesLoading] = useState(true);
  const [geofencesError, setGeofencesError] = useState<string | null>(null);
  const [geofenceVisibility, setGeofenceVisibility] = useState<
    Record<GeofenceType, boolean>
  >(initialGeofenceVisibility);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(
    null,
  );
  const [pointGeofences, setPointGeofences] = useState<Geofence[]>([]);
  const [pointLookup, setPointLookup] = useState({
    loading: false,
    error: null as string | null,
  });

  useEffect(() => {
    const controller = new AbortController();
    void eventsApi
      .listPublic(controller.signal)
      .then((items) => {
        setEvents(items.filter(isPublishedEvent));
        setRequestState("success");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRequestError(messageFor(error));
          setRequestState("error");
        }
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    let active = true;
    void new GeofencesApi()
      .list()
      .then((items) => active && setGeofences(items))
      .catch(
        () =>
          active && setGeofencesError("No fue posible cargar las geocercas."),
      )
      .finally(() => active && setGeofencesLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visibleEvents = useMemo(
    () => filterMapEvents(events, { search, type, date, now: new Date() }),
    [date, events, search, type],
  );
  const visibleSelectedEventId = visibleEvents.some(
    (event) => event.id === selectedEventId,
  )
    ? selectedEventId
    : null;
  const selectedEvent =
    visibleEvents.find((event) => event.id === visibleSelectedEventId) ?? null;
  const mobileSheetState = getMobileMapSheetState(
    sidebarVisible,
    visibleSelectedEventId,
  );
  const eventTypes = useMemo(
    () => [...new Set(events.map((event) => event.type))].sort(),
    [events],
  );

  useEffect(() => {
    if (!selectedEvent) return;
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => {
        if (!controller.signal.aborted)
          setPointLookup({ loading: true, error: null });
        return new GeofencesApi().contains(
          selectedEvent.coordinates.latitude,
          selectedEvent.coordinates.longitude,
        );
      })
      .then((items) => {
        if (!controller.signal.aborted) {
          setPointGeofences(items);
          if (items[0]) setSelectedGeofenceId(items[0].id);
        }
      })
      .catch(
        () =>
          !controller.signal.aborted &&
          setPointLookup({
            loading: false,
            error: "No fue posible consultar el territorio del evento.",
          }),
      )
      .finally(
        () =>
          !controller.signal.aborted &&
          setPointLookup((state) => ({ ...state, loading: false })),
      );
    return () => controller.abort();
  }, [selectedEvent]);

  const selectEvent = useCallback((id: UUID) => setSelectedEventId(id), []);
  const retryEvents = useCallback(() => {
    setRequestState("loading");
    setRequestError(null);
    setReload((value) => value + 1);
  }, []);
  const toggleGeofenceType = useCallback((geofenceType: GeofenceType) => {
    setGeofenceVisibility((current) => ({
      ...current,
      [geofenceType]: !current[geofenceType],
    }));
  }, []);

  return (
    <main
      className="flex h-full min-h-[calc(100vh-4rem)] flex-col overflow-hidden"
      style={{ background: "var(--cyber-bg)", color: "var(--cyber-text)" }}
    >
      <header
        className="flex items-center justify-between border-b px-4 py-2"
        style={{
          background: "var(--cyber-surface-1)",
          borderColor: "var(--cyber-border-subtle)",
        }}
      >
        <button
          type="button"
          onClick={() => setSidebarVisible((value) => !value)}
          aria-label={
            sidebarVisible ? "Ocultar explorador" : "Mostrar explorador"
          }
          aria-expanded={sidebarVisible}
          className="p-1.5"
          style={{ color: "var(--cyber-text-secondary)" }}
        >
          {sidebarVisible ? (
            <PanelLeftClose size={18} />
          ) : (
            <PanelLeft size={18} />
          )}
        </button>
        <p
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--cyber-cyan)" }}
        >
          EVENTOS PÚBLICOS
        </p>
        <button
          type="button"
          onClick={() => setPanelCapasAbierto((value) => !value)}
          aria-label="Capas territoriales"
          aria-expanded={panelCapasAbierto}
          className="flex items-center gap-2 border px-3 py-1.5 text-xs"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          <Layers size={14} /> Capas
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "z-20 w-full shrink-0 overflow-y-auto border-r sm:w-80",
            "max-sm:absolute max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[62dvh] max-sm:rounded-t-xl",
            sidebarVisible ? "block" : "hidden",
          )}
          aria-label="Explorador de eventos"
          data-sheet-state={mobileSheetState}
          style={{
            background: "var(--cyber-surface-1)",
            borderColor: "var(--cyber-border-subtle)",
          }}
        >
          <div className="space-y-3 p-3">
            <label className="block text-xs" htmlFor="event-search">
              Buscar eventos
            </label>
            <input
              id="event-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border bg-transparent px-2 py-2 text-sm"
              placeholder="Nombre, lugar o descripción"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">
                Tipo
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-1 w-full border bg-transparent p-2"
                >
                  <option value="all">Todos</option>
                  {eventTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                Fecha
                <select
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value as DateFilter)
                  }
                  className="mt-1 w-full border bg-transparent p-2"
                >
                  <option value="all">Todas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Próximos 7 días</option>
                </select>
              </label>
            </div>
          </div>
          <section
            aria-live="polite"
            aria-busy={requestState === "loading"}
            className="border-t"
            style={{ borderColor: "var(--cyber-border-subtle)" }}
          >
            <p
              className="px-4 pt-3 text-xs"
              style={{ color: "var(--cyber-text-secondary)" }}
            >
              {visibleEvents.length} resultados en el área visible
            </p>
            {requestState === "loading" && (
              <p className="p-4 text-sm">Cargando eventos públicos…</p>
            )}
            {requestState === "error" && (
              <div role="alert" className="space-y-3 p-4 text-sm">
                <p>{requestError}</p>
                <button
                  type="button"
                  onClick={retryEvents}
                  className="flex items-center gap-2 border px-3 py-2"
                >
                  <RotateCw size={14} /> Reintentar
                </button>
              </div>
            )}
            {requestState === "success" && visibleEvents.length === 0 && (
              <p className="p-4 text-sm">
                No hay eventos públicos que coincidan con los filtros.
              </p>
            )}
            {requestState === "success" &&
              visibleEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  aria-pressed={visibleSelectedEventId === event.id}
                  className="block w-full border-b p-4 text-left focus-visible:outline focus-visible:outline-2"
                  style={{
                    borderColor: "var(--cyber-border-subtle)",
                    background:
                      visibleSelectedEventId === event.id
                        ? "var(--cyber-cyan-dim)"
                        : "transparent",
                  }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--cyber-cyan)" }}
                  >
                    {event.type}
                  </span>
                  <strong className="mt-1 block">{event.name}</strong>
                  <span className="mt-1 block text-xs">
                    {event.locationText} ·{" "}
                    {event.startsAt.toLocaleDateString("es-MX")}
                  </span>
                </button>
              ))}
          </section>
          {selectedEvent && (
            <section
              className="space-y-2 border-t p-4"
              aria-label="Evento seleccionado"
              style={{ borderColor: "var(--cyber-border-subtle)" }}
            >
              <h2 className="font-semibold">{selectedEvent.name}</h2>
              <p className="text-sm">{selectedEvent.description}</p>
              <div className="flex gap-2">
                <a
                  className="border px-3 py-2 text-sm"
                  href={`/eventos?evento=${encodeURIComponent(selectedEvent.id)}`}
                >
                  Ver detalle
                </a>
                <a
                  className="border px-3 py-2 text-sm"
                  href={
                    selectedEvent.mapUrl ??
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.coordinates.latitude},${selectedEvent.coordinates.longitude}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Cómo llegar
                </a>
              </div>
            </section>
          )}
        </aside>
        <section
          className="relative min-w-0 flex-1 max-sm:min-h-[calc(100dvh-7rem)]"
          aria-label="Mapa de eventos"
        >
          <MapaVista
            events={visibleEvents}
            selectedEventId={visibleSelectedEventId}
            onSelectEvent={selectEvent}
            panelAbierto={panelCapasAbierto}
            onCerrarPanel={() => setPanelCapasAbierto(false)}
            geofences={geofences}
            geofencesLoading={geofencesLoading}
            geofencesError={geofencesError}
            geofenceVisibility={geofenceVisibility}
            selectedGeofenceId={selectedGeofenceId}
            onToggleGeofenceType={toggleGeofenceType}
            onSelectGeofence={setSelectedGeofenceId}
            pointGeofences={pointGeofences}
            pointLookup={pointLookup}
          />
        </section>
      </div>
    </main>
  );
}
