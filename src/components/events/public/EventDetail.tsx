import * as React from "react";

void React;

import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events";

import { EventStatusBadge } from "./EventStatusBadge";
import { formatEventDate } from "./formatEventDate";

export type EventDetailProps = {
  event: Event;
  onBack: () => void;
};

export function EventDetail({ event, onBack }: EventDetailProps) {
  return (
    <article
      className="public-event-detail"
      aria-labelledby="public-event-detail-title"
    >
      <Button
        type="button"
        variant="link"
        className="public-event-detail__back"
        onClick={onBack}
      >
        ← Todos los eventos
      </Button>
      <div className="public-event-detail__meta-row">
        <p className="public-event-detail__type">{event.type}</p>
        <EventStatusBadge status={event.status} />
      </div>
      <h1 id="public-event-detail-title" className="public-event-detail__title">
        {event.name}
      </h1>
      <p className="public-event-detail__description">{event.description}</p>
      <dl className="public-event-meta">
        <div>
          <dt>Inicio</dt>
          <dd>{formatEventDate(event.startsAt)}</dd>
        </div>
        <div>
          <dt>Fin</dt>
          <dd>{formatEventDate(event.endsAt)}</dd>
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
        <Button asChild variant="outline">
          <a href={event.mapUrl} target="_blank" rel="noreferrer">
            Abrir mapa
          </a>
        </Button>
      )}
    </article>
  );
}
