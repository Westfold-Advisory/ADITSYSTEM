import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  EventCard,
  EventDetail,
  EventList,
  EventStatusBadge,
  formatEventDate,
  readEventIdFromSearch,
  writeEventIdToSearch,
} from "@/components/events/public";
import type { Event } from "@/types/events";

const sampleEvent = (overrides: Partial<Event> = {}): Event => ({
  id: "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
  createdBy: "9dc34b3d-0cde-4c47-bc13-44a55b12e151",
  type: "Asamblea",
  name: "Evento de prueba",
  description: "Descripción del evento",
  coordinates: { latitude: 19.4, longitude: -99.1 },
  locationText: "Centro",
  mapUrl: null,
  startsAt: new Date("2026-09-15T18:00:00Z"),
  endsAt: new Date("2026-09-15T20:00:00Z"),
  status: "PUBLICADO",
  maximumCapacity: 120,
  requiresCheckin: false,
  checkinOpensAt: null,
  checkinClosesAt: null,
  checkinRadiusMeters: null,
  version: 1,
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
  deletedAt: null,
  ...overrides,
});

describe("public event pattern components", () => {
  it("EventStatusBadge exposes status text", () => {
    const html = renderToStaticMarkup(
      createElement(EventStatusBadge, { status: "PUBLICADO" }),
    );
    assert.match(html, />Publicado</);
  });

  it("EventCard includes accessible action and capacity", () => {
    const html = renderToStaticMarkup(
      createElement(EventCard, { event: sampleEvent(), onOpen: () => {} }),
    );
    assert.match(html, /aria-label="Ver detalle de Evento de prueba"/);
    assert.match(html, /120 personas/);
  });

  it("EventDetail uses one h1", () => {
    const html = renderToStaticMarkup(
      createElement(EventDetail, {
        event: sampleEvent(),
        onBack: () => {},
      }),
    );
    assert.match(html, /<h1[^>]*id="public-event-detail-title"/);
  });

  it("EventList renders grid list", () => {
    const html = renderToStaticMarkup(
      createElement(EventList, {
        events: [sampleEvent()],
        onSelectEvent: () => {},
      }),
    );
    assert.match(html, /public-event-list/);
  });

  it("formatEventDate uses es-MX locale", () => {
    assert.match(formatEventDate(new Date("2026-09-15T18:00:00Z")), /2026/);
  });

  it("URL helpers read and write evento query", () => {
    const withEvent = writeEventIdToSearch(
      "",
      "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
    );
    assert.equal(
      readEventIdFromSearch(withEvent),
      "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
    );
    assert.equal(
      readEventIdFromSearch(writeEventIdToSearch(withEvent, null)),
      null,
    );
  });
});
