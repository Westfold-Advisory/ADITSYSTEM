import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterMapEvents } from "./map-events";
import type { Event } from "@/types/events";

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

describe("map event filters", () => {
  it("keeps list and marker source limited to published events", () =>
    assert.deepEqual(
      filterMapEvents([event("a", "PUBLICADO"), event("b", "BORRADOR")], {
        search: "",
        type: "all",
        date: "all",
        now: new Date("2026-09-20T08:00:00Z"),
      }).map((item) => item.id),
      ["a"],
    ));
  it("filters the shared source by text, type, and date", () =>
    assert.deepEqual(
      filterMapEvents(
        [
          event("a", "PUBLICADO"),
          event("b", "PUBLICADO", "Foro", "2026-10-10T12:00:00Z"),
        ],
        {
          search: "foro",
          type: "Foro",
          date: "week",
          now: new Date("2026-09-20T08:00:00Z"),
        },
      ),
      [],
    ));
});
