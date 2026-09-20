import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, PanelLeft, PanelLeftClose } from "lucide-react";

import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import { MapaVista } from "@/components/ui/MapaVista";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
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
  const capasTriggerRef = useRef<HTMLButtonElement>(null);
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
    <div className="map-page">
      <div className="map-page__layout">
        <aside
          id="map-explorer"
          className={cn(
            "map-page__explorer",
            !sidebarVisible && "map-page__explorer--hidden",
          )}
          aria-label="Explorador de eventos"
          data-sheet-state={mobileSheetState}
        >
          <div className="map-page__explorer-header">
            <h2 className="map-page__explorer-title">Explorador de eventos</h2>
          </div>
          <div className="map-page__filters">
            <Field label="Buscar eventos">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre, lugar o descripción"
                autoComplete="off"
              />
            </Field>
            <div className="map-page__filter-row">
              <Field label="Tipo">
                <select
                  className="ui-control"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="all">Todos</option>
                  {eventTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fecha">
                <select
                  className="ui-control"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value as DateFilter)
                  }
                >
                  <option value="all">Todas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Próximos 7 días</option>
                </select>
              </Field>
            </div>
          </div>
          <section
            id="map-event-results"
            aria-live="polite"
            aria-busy={requestState === "loading"}
            className="map-page__results"
          >
            <p className="map-page__results-summary">
              {visibleEvents.length} resultados en el área visible
            </p>
            {requestState === "loading" && (
              <LoadingState label="Cargando eventos públicos…" />
            )}
            {requestState === "error" && requestError && (
              <ErrorState message={requestError} onRetry={retryEvents} />
            )}
            {requestState === "success" && visibleEvents.length === 0 && (
              <EmptyState
                actionLabel="Actualizar listado"
                onAction={retryEvents}
              >
                No hay eventos públicos que coincidan con los filtros.
              </EmptyState>
            )}
            {requestState === "success" && visibleEvents.length > 0 && (
              <ul className="map-page__event-list" role="list">
                {visibleEvents.map((event) => {
                  const isSelected = visibleSelectedEventId === event.id;
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        className="map-page__event-item"
                        onClick={() => selectEvent(event.id)}
                        aria-pressed={isSelected}
                      >
                        {isSelected && (
                          <span className="map-page__event-selected-badge">
                            Seleccionado
                          </span>
                        )}
                        <span className="map-page__event-type">
                          {event.type}
                        </span>
                        <strong className="map-page__event-name">
                          {event.name}
                        </strong>
                        <span className="map-page__event-meta">
                          {event.locationText} ·{" "}
                          {event.startsAt.toLocaleDateString("es-MX")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          {selectedEvent && (
            <section
              className="map-page__detail"
              aria-label="Evento seleccionado"
            >
              <h2>{selectedEvent.name}</h2>
              <p>{selectedEvent.description}</p>
              <div className="map-page__detail-actions">
                <Button variant="outline" asChild>
                  <a
                    href={`/eventos?evento=${encodeURIComponent(selectedEvent.id)}`}
                  >
                    Ver detalle
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={
                      selectedEvent.mapUrl ??
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.coordinates.latitude},${selectedEvent.coordinates.longitude}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Cómo llegar
                  </a>
                </Button>
              </div>
            </section>
          )}
        </aside>
        <section
          className="map-page__map"
          aria-label="Mapa de eventos"
          aria-describedby="map-canvas-hint"
        >
          <p id="map-canvas-hint" className="sr-only">
            El mapa interactivo complementa la lista de eventos. Para buscar,
            filtrar y abrir un evento sin puntero, use el explorador de eventos
            (botón «Mostrar explorador» si está oculto).
          </p>
          <div className="map-page__map-toolbar">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setSidebarVisible((value) => !value)}
              aria-label={
                sidebarVisible ? "Ocultar explorador" : "Mostrar explorador"
              }
              aria-expanded={sidebarVisible}
              aria-controls="map-explorer"
            >
              {sidebarVisible ? (
                <PanelLeftClose aria-hidden="true" />
              ) : (
                <PanelLeft aria-hidden="true" />
              )}
            </Button>
            <Button
              ref={capasTriggerRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPanelCapasAbierto((value) => !value)}
              aria-label="Capas territoriales"
              aria-expanded={panelCapasAbierto}
              aria-haspopup="dialog"
            >
              <Layers aria-hidden="true" />
              Capas
            </Button>
          </div>
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
            capasTriggerRef={capasTriggerRef}
          />
        </section>
      </div>
    </div>
  );
}
