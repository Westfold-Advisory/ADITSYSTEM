import { useCallback, useEffect, useReducer } from "react";

import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import {
  EventDetail,
  EventList,
  clearPublicEventDetailUrl,
  pushPublicEventDetailUrl,
  readPublicEventIdFromUrl,
} from "@/components/events/public";
import { getInstitutionConfig } from "@/config/institution";
import { isPublishedEvent } from "@/lib/public-events";
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

export function PublicEventsPage() {
  const institution = getInstitutionConfig();
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
  const [selectedEventId, setSelectedEventId] = useReducer(
    (_: UUID | null, next: UUID | null) => next,
    null,
    () => readPublicEventIdFromUrl(),
  );

  useEffect(() => {
    const syncFromUrl = () => {
      setSelectedEventId(readPublicEventIdFromUrl());
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dispatchList({ type: "loading" });
    void eventsApi
      .listPublic(controller.signal)
      .then((events) =>
        dispatchList({
          type: "success",
          value: events.filter(isPublishedEvent),
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
        if (!isPublishedEvent(event)) {
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

  const openEvent = useCallback((id: UUID) => {
    pushPublicEventDetailUrl(id);
    setSelectedEventId(id);
  }, []);

  const closeDetail = useCallback(() => {
    clearPublicEventDetailUrl();
    setSelectedEventId(null);
  }, []);

  return (
    <div className="public-events-page">
      <header className="public-events-header">
        <p className="eyebrow">{institution.productName}</p>
        <h1>Eventos públicos</h1>
        <p>Consulta las actividades publicadas y su información actualizada.</p>
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
            <EventDetail event={detailState.value} onBack={closeDetail} />
          )}
        </section>
      ) : (
        <section aria-live="polite" aria-busy={listState.status === "loading"}>
          {listState.status === "loading" && (
            <LoadingState label="Cargando eventos…">
              <EventListSkeleton />
            </LoadingState>
          )}
          {listState.status === "error" && (
            <ErrorState message={listState.message} onRetry={reloadList} />
          )}
          {listState.status === "success" && listState.value.length === 0 && (
            <EmptyState actionLabel="Actualizar listado" onAction={reloadList}>
              No hay eventos públicos disponibles por el momento.
            </EmptyState>
          )}
          {listState.status === "success" && listState.value.length > 0 && (
            <EventList events={listState.value} onSelectEvent={openEvent} />
          )}
        </section>
      )}
    </div>
  );
}
