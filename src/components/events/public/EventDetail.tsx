import * as React from "react";

void React;

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/events";

import { EventStatusBadge } from "./EventStatusBadge";
import { formatEventDate } from "./formatEventDate";

export type EventDetailProps = {
  event: Event;
  onBack: () => void;
  mapExploreHref: string;
};

export function EventDetail({
  event,
  onBack,
  mapExploreHref,
}: EventDetailProps) {
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
      <div className="public-event-detail__actions">
        <a
          className={cn(buttonVariants({ variant: "outline" }))}
          href={mapExploreHref}
        >
          Ver en mapa
        </a>
        {event.mapUrl && (
          <a
            className={cn(buttonVariants({ variant: "outline" }))}
            href={event.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar
          </a>
        )}
      </div>
    </article>
  );
}
