import * as React from "react";

void React;

import type { Event, UUID } from "@/types/events";

import { EventCard } from "./EventCard";

export type EventListProps = {
  events: Event[];
  onSelectEvent: (id: UUID) => void;
};

export function EventList({ events, onSelectEvent }: EventListProps) {
  return (
    <ul className="public-event-list">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} onOpen={() => onSelectEvent(event.id)} />
        </li>
      ))}
    </ul>
  );
}
