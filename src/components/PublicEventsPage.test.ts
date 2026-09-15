import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPublishedEvent } from "@/lib/public-events";
import type { Event } from "@/types/events";

const event = (status: Event["status"]): Event => ({
  id: "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
  createdBy: "9dc34b3d-0cde-4c47-bc13-44a55b12e151",
  type: "Asamblea",
  name: "Evento de prueba",
  description: "Descripción",
  coordinates: { latitude: 19.4, longitude: -99.1 },
  locationText: "Centro",
  mapUrl: null,
  startsAt: new Date("2026-09-15T18:00:00Z"),
  endsAt: new Date("2026-09-15T20:00:00Z"),
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
  it("only renders events explicitly published by the API", () => {
    assert.equal(isPublishedEvent(event("PUBLICADO")), true);
    assert.equal(isPublishedEvent(event("BORRADOR")), false);
    assert.equal(isPublishedEvent(event("CANCELADO")), false);
  });
});
