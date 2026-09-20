import { useCallback, useEffect, useMemo, useReducer } from "react";

import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import {
  EventDetail,
  EventList,
  PublicEventFiltersForm,
  clearPublicEventDetailUrl,
  parsePublicEventFilters,
  pushPublicEventDetailUrl,
  readPublicEventIdFromUrl,
} from "@/components/events/public";
import {
  buildPublicEventQueryString,
  filterPublicEvents,
  publicMapHref,
  type PublicEventFilters,
} from "@/lib/public-event-filters";
import { isPublicEvent } from "@/lib/public-events";
import type { Event, UUID } from "@/types/events";
import { EmptyState, ErrorState, LoadingState } from "./ui/AsyncState";
import { EventDetailSkeleton, EventListSkeleton } from "./ui/Skeleton";

import "./events/public/events-public.css";

const eventsApi = new EventsApi(new ApiClient());

type RequestState<T> =
  | { status: "idle"; value: null; message: null }
  | { status: "loading"; value: null; message: null }
  | { status: "success"; value: T; message: null }
  | { status: "error"; value: null; message: string };

type RequestAction<T> =
  | { type: "loading" }
  | { type: "success"; value: T }
  | { type: "error"; message: string };

function requestReducer<T>(
  _state: RequestState<T>,
  action: RequestAction<T>,
): RequestState<T> {
  switch (action.type) {
    case "loading":
      return { status: "loading", value: null, message: null };
    case "success":
      return { status: "success", value: action.value, message: null };
    case "error":
      return { status: "error", value: null, message: action.message };
  }
}

function messageFor(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible obtener los eventos. Intenta nuevamente.";
}

function readFiltersFromUrl(): PublicEventFilters {
  return parsePublicEventFilters(window.location.search);
}

export function PublicEventsPage() {
  const [listState, dispatchList] = useReducer(requestReducer<Event[]>, {
    status: "loading",
    value: null,
    message: null,
  });
  const [detailState, dispatchDetail] = useReducer(requestReducer<Event>, {
    status: "idle",
    value: null,
    message: null,
  });
  const [reload, reloadList] = useReducer((value: number) => value + 1, 0);
  const [detailReload, reloadDetail] = useReducer(
    (value: number) => value + 1,
    0,
  );
  const [filters, setFilters] = useReducer(
    (_: PublicEventFilters, next: PublicEventFilters) => next,
    readFiltersFromUrl(),
  );
  const [selectedEventId, setSelectedEventId] = useReducer(
    (_: UUID | null, next: UUID | null) => next,
    null,
    () => readPublicEventIdFromUrl(),
  );

  const syncFromUrl = useCallback(() => {
    setFilters(readFiltersFromUrl());
    setSelectedEventId(readPublicEventIdFromUrl());
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [syncFromUrl]);

  useEffect(() => {
    const nextSearch = buildPublicEventQueryString({
      filters,
      eventId: selectedEventId,
    });
    const target = `${window.location.pathname}${nextSearch}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (target !== current) {
      window.history.replaceState(null, "", target);
    }
  }, [filters, selectedEventId]);

  useEffect(() => {
    const controller = new AbortController();
    dispatchList({ type: "loading" });
    void eventsApi
      .listPublic(controller.signal)
      .then((events) =>
        dispatchList({
          type: "success",
          value: events.filter((event) => isPublicEvent(event)),
        }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        dispatchList({ type: "error", message: messageFor(error) });
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!selectedEventId) {
      dispatchDetail({ type: "loading" });
      return;
    }
    const controller = new AbortController();
    dispatchDetail({ type: "loading" });
    void eventsApi
      .getPublic(selectedEventId, controller.signal)
      .then((event) => {
        if (!isPublicEvent(event)) {
          throw new Error("El evento no está disponible públicamente.");
        }
        dispatchDetail({ type: "success", value: event });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        dispatchDetail({ type: "error", message: messageFor(error) });
      });
    return () => controller.abort();
  }, [detailReload, selectedEventId]);

  const eventTypes = useMemo(() => {
    if (listState.status !== "success" || !listState.value) return [];
    return [...new Set(listState.value.map((event) => event.type))].sort();
  }, [listState]);

  const visibleEvents = useMemo(() => {
    if (listState.status !== "success" || !listState.value) return [];
    return filterPublicEvents(listState.value, {
      ...filters,
      now: new Date(),
    });
  }, [filters, listState]);

  const openEvent = useCallback((id: UUID) => {
    pushPublicEventDetailUrl(id);
    setSelectedEventId(id);
  }, []);

  const closeDetail = useCallback(() => {
    clearPublicEventDetailUrl();
    setSelectedEventId(null);
  }, []);

  const mapHref = publicMapHref(filters);
  const mapDetailHref =
    selectedEventId && detailState.status === "success" && detailState.value
      ? publicMapHref(filters, detailState.value.id)
      : mapHref;

  return (
    <div className="public-events-page">
      <header className="public-events-header">
        <h1>Eventos públicos</h1>
        <p className="public-events-header__intro">
          Consulta las actividades publicadas y su información actualizada.
        </p>
      </header>

      {selectedEventId ? (
        <section
          aria-live="polite"
          aria-busy={detailState.status === "loading"}
        >
          {detailState.status === "loading" && (
            <LoadingState label="Cargando evento…">
              <EventDetailSkeleton />
            </LoadingState>
          )}
          {detailState.status === "error" && (
            <ErrorState message={detailState.message} onRetry={reloadDetail} />
          )}
          {detailState.status === "success" && detailState.value && (
            <EventDetail
              event={detailState.value}
              onBack={closeDetail}
              mapExploreHref={mapDetailHref}
            />
          )}
        </section>
      ) : (
        <>
          <PublicEventFiltersForm
            filters={filters}
            eventTypes={eventTypes}
            onChange={setFilters}
          />
          <section
            aria-live="polite"
            aria-busy={listState.status === "loading"}
          >
            <p className="public-event-results-summary">
              {listState.status === "success"
                ? `${visibleEvents.length} evento${visibleEvents.length === 1 ? "" : "s"} encontrado${visibleEvents.length === 1 ? "" : "s"}`
                : "Cargando resultados…"}
            </p>
            {listState.status === "loading" && (
              <LoadingState label="Cargando eventos…">
                <EventListSkeleton />
              </LoadingState>
            )}
            {listState.status === "error" && (
              <ErrorState message={listState.message} onRetry={reloadList} />
            )}
            {listState.status === "success" &&
              listState.value.length > 0 &&
              visibleEvents.length === 0 && (
                <EmptyState
                  actionLabel="Quitar filtros"
                  onAction={() => setFilters(parsePublicEventFilters(""))}
                >
                  No hay eventos que coincidan con los filtros actuales.
                </EmptyState>
              )}
            {listState.status === "success" && listState.value.length === 0 && (
              <EmptyState
                actionLabel="Actualizar listado"
                onAction={reloadList}
              >
                No hay eventos públicos disponibles por el momento.
              </EmptyState>
            )}
            {listState.status === "success" && visibleEvents.length > 0 && (
              <EventList events={visibleEvents} onSelectEvent={openEvent} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
