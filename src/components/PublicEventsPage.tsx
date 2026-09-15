import { useCallback, useEffect, useReducer, useState } from "react";

import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import { isPublishedEvent } from "@/lib/public-events";
import type { Event, UUID } from "@/types/events";

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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function EventCard({ event, onOpen }: { event: Event; onOpen: () => void }) {
  return (
    <article className="event-card">
      <p className="event-type">{event.type}</p>
      <h2>{event.name}</h2>
      <p>{event.description}</p>
      <dl>
        <div>
          <dt>Fecha</dt>
          <dd>{formatDate(event.startsAt)}</dd>
        </div>
        <div>
          <dt>Lugar</dt>
          <dd>{event.locationText}</dd>
        </div>
      </dl>
      <button type="button" onClick={onOpen} aria-label={`Ver ${event.name}`}>
        Ver detalle
      </button>
    </article>
  );
}

function EventDetail({ event, onBack }: { event: Event; onBack: () => void }) {
  return (
    <article className="event-detail" aria-labelledby="event-title">
      <button type="button" className="back-link" onClick={onBack}>
        ← Todos los eventos
      </button>
      <p className="event-type">{event.type}</p>
      <h1 id="event-title">{event.name}</h1>
      <p className="event-description">{event.description}</p>
      <dl>
        <div>
          <dt>Inicio</dt>
          <dd>{formatDate(event.startsAt)}</dd>
        </div>
        <div>
          <dt>Fin</dt>
          <dd>{formatDate(event.endsAt)}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{event.locationText}</dd>
        </div>
        {event.maximumCapacity !== null && (
          <div>
            <dt>Capacidad</dt>
            <dd>{event.maximumCapacity} personas</dd>
          </div>
        )}
      </dl>
      {event.mapUrl && (
        <a href={event.mapUrl} target="_blank" rel="noreferrer">
          Abrir mapa
        </a>
      )}
    </article>
  );
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
  const [selectedEventId, setSelectedEventId] = useState<UUID | null>(null);

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
    if (!selectedEventId) return;
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

  const openEvent = useCallback((id: UUID) => setSelectedEventId(id), []);

  const closeDetail = () => {
    setSelectedEventId(null);
    dispatchDetail({ type: "loading" });
  };

  return (
    <main className="public-events-page">
      <header className="public-events-header">
        <p className="eyebrow">ADIT SYSTEM</p>
        <h1>Eventos públicos</h1>
        <p>Consulta las actividades publicadas y su información actualizada.</p>
      </header>

      {selectedEventId ? (
        <section
          aria-live="polite"
          aria-busy={detailState.status === "loading"}
        >
          {detailState.status === "loading" && <p>Cargando evento…</p>}
          {detailState.status === "error" && (
            <div className="request-message error" role="alert">
              <p>{detailState.message}</p>
              <button type="button" onClick={reloadDetail}>
                Reintentar
              </button>
              <button type="button" onClick={closeDetail}>
                Volver al listado
              </button>
            </div>
          )}
          {detailState.status === "success" && detailState.value && (
            <EventDetail event={detailState.value} onBack={closeDetail} />
          )}
        </section>
      ) : (
        <section aria-live="polite" aria-busy={listState.status === "loading"}>
          {listState.status === "loading" && <p>Cargando eventos…</p>}
          {listState.status === "error" && (
            <div className="request-message error" role="alert">
              <p>{listState.message}</p>
              <button type="button" onClick={reloadList}>
                Reintentar
              </button>
            </div>
          )}
          {listState.status === "success" && listState.value.length === 0 && (
            <div className="request-message">
              <p>No hay eventos públicos disponibles por el momento.</p>
              <button type="button" onClick={reloadList}>
                Actualizar listado
              </button>
            </div>
          )}
          {listState.status === "success" && listState.value.length > 0 && (
            <div className="event-grid">
              {listState.value.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  onOpen={() => openEvent(event.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
