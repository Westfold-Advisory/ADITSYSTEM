import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Event } from "@/types/events";
import {
  buildPublicEventQueryString,
  emptyPublicEventFilters,
  filterPublicEvents,
  parsePublicEventFilters,
  publicEventsDetailHref,
  publicMapHref,
} from "./public-event-filters";
import { filterMapEvents } from "./map-events";

const event = (
  id: string,
  status: Event["status"],
  type = "Asamblea",
  startsAt = "2026-09-20T12:00:00Z",
): Event => ({
  id,
  createdBy: "author",
  type,
  name: `Evento ${id}`,
  description: "Descripción",
  coordinates: { latitude: 19.4, longitude: -99.1 },
  locationText: "Centro",
  mapUrl: null,
  startsAt: new Date(startsAt),
  endsAt: new Date(startsAt),
  status,
  maximumCapacity: null,
  requiresCheckin: false,
  checkinOpensAt: null,
  checkinClosesAt: null,
  checkinRadiusMeters: null,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe("public event filters", () => {
  it("parses and serializes filter query params", () => {
    const filters = parsePublicEventFilters("?q=foro&tipo=Foro&fecha=week");
    assert.deepEqual(filters, {
      search: "foro",
      type: "Foro",
      date: "week",
    });
    assert.equal(
      buildPublicEventQueryString({ filters }),
      "?q=foro&tipo=Foro&fecha=week",
    );
  });

  it("builds cross-route hrefs preserving filters and selection", () => {
    const filters = { ...emptyPublicEventFilters, search: "centro" };
    assert.equal(publicMapHref(filters, "ev-1"), "/mapa?q=centro&evento=ev-1");
    assert.equal(
      publicEventsDetailHref("ev-1", filters),
      "/eventos?q=centro&evento=ev-1",
    );
  });

  it("matches map filter parity for published events", () => {
    const now = new Date("2026-09-20T08:00:00Z");
    const input = [event("a", "PUBLICADO"), event("b", "BORRADOR")];
    const filters = {
      search: "",
      type: "all",
      date: "all" as const,
      now,
    };
    assert.deepEqual(
      filterPublicEvents(input, filters).map((item) => item.id),
      filterMapEvents(input, filters).map((item) => item.id),
    );
  });

  it("filters by text, type, and date window", () => {
    const now = new Date("2026-09-20T08:00:00Z");
    assert.deepEqual(
      filterPublicEvents(
        [
          event("a", "PUBLICADO"),
          event("b", "PUBLICADO", "Foro", "2026-10-10T12:00:00Z"),
        ],
        { search: "foro", type: "Foro", date: "week", now },
      ),
      [],
    );
  });
});
