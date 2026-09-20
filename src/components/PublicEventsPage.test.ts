import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPublicEvent } from "@/lib/public-events";
import type { Event } from "@/types/events";

const event = (
  status: Event["status"],
  endsAt = "2026-09-15T20:00:00Z",
): Event => ({
  id: "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
  createdBy: "9dc34b3d-0cde-4c47-bc13-44a55b12e151",
  type: "Asamblea",
  name: "Evento de prueba",
  description: "Descripción",
  coordinates: { latitude: 19.4, longitude: -99.1 },
  locationText: "Centro",
  mapUrl: null,
  startsAt: new Date("2026-09-15T18:00:00Z"),
  endsAt: new Date(endsAt),
  status,
  maximumCapacity: null,
  requiresCheckin: false,
  checkinOpensAt: null,
  checkinClosesAt: null,
  checkinRadiusMeters: null,
  version: 1,
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
  deletedAt: null,
});

describe("public events visibility", () => {
  it("always shows published events regardless of date", () => {
    assert.equal(isPublicEvent(event("PUBLICADO")), true);
  });

  it("never shows drafts or cancelled events", () => {
    assert.equal(isPublicEvent(event("BORRADOR")), false);
    assert.equal(isPublicEvent(event("CANCELADO")), false);
  });

  it("shows in-progress events", () => {
    const now = new Date("2026-09-15T19:00:00Z");
    assert.equal(isPublicEvent(event("EN_CURSO"), now), true);
  });

  it("shows finished events within the last 7 days", () => {
    const finished = event("FINALIZADO", "2026-09-15T20:00:00Z");
    const sixDaysLater = new Date("2026-09-21T20:00:00Z");
    assert.equal(isPublicEvent(finished, sixDaysLater), true);
  });

  it("hides finished events older than 7 days", () => {
    const finished = event("FINALIZADO", "2026-09-15T20:00:00Z");
    const eightDaysLater = new Date("2026-09-23T20:01:00Z");
    assert.equal(isPublicEvent(finished, eightDaysLater), false);
  });
});
