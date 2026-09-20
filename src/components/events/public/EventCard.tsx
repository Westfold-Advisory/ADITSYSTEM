import * as React from "react";

void React;

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events";

import { EventStatusBadge } from "./EventStatusBadge";
import { formatEventDate } from "./formatEventDate";

export type EventCardProps = {
  event: Event;
  onOpen: () => void;
};

export function EventCard({ event, onOpen }: EventCardProps) {
  return (
    <Card className="public-event-card">
      <div className="public-event-card__meta-row">
        <p className="public-event-card__type">{event.type}</p>
        <EventStatusBadge status={event.status} />
      </div>
      <h2 className="public-event-card__title">{event.name}</h2>
      <p className="public-event-card__description">{event.description}</p>
      <dl className="public-event-meta">
        <div>
          <dt>Fecha</dt>
          <dd>{formatEventDate(event.startsAt)}</dd>
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
      <Button
        type="button"
        variant="default"
        onClick={onOpen}
        aria-label={`Ver detalle de ${event.name}`}
      >
        Ver detalle
      </Button>
    </Card>
  );
}
