import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EventsApi, mapEventInput, mapEventResponse } from "./events";
import { ApiClient, ApiError } from "./http";

const response = {
  id: "5ad4ce54-72f9-4c15-9cbb-43f6a5bcd9e0",
  created_by: "9dc34b3d-0cde-4c47-bc13-44a55b12e151",
  tipo: "Asamblea",
  nombre: "Evento público",
  descripcion: "Descripción",
  latitud: "19.4326",
  longitud: "-99.1332",
  ubicacion_texto: "Centro",
  url_mapa: null,
  fecha_inicio: "2026-09-15T18:00:00Z",
  fecha_fin: "2026-09-15T20:00:00Z",
  estatus: "PUBLICADO" as const,
  capacidad_maxima: 50,
  requiere_checkin: true,
  checkin_abierto_desde: null,
  checkin_abierto_hasta: null,
  checkin_radio_metros: 100,
  version: 1,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  deleted_at: null,
};

describe("event mappers", () => {
  it("maps FastAPI snake_case, decimal coordinates and UTC dates to the event domain", () => {
    const event = mapEventResponse(response);
    assert.deepEqual(event.coordinates, {
      latitude: 19.4326,
      longitude: -99.1332,
    });
    assert.equal(event.status, "PUBLICADO");
    assert.equal(event.startsAt.toISOString(), "2026-09-15T18:00:00.000Z");
  });

  it("maps input back to the FastAPI contract with UTC dates", () => {
    const payload = mapEventInput({
      type: "Asamblea",
      name: "Nombre",
      description: "Descripción",
      coordinates: { latitude: 19, longitude: -99 },
      locationText: "Centro",
      startsAt: "2026-09-15T12:00:00-06:00",
      endsAt: "2026-09-15T14:00:00-06:00",
    });
    assert.equal(payload.fecha_inicio, "2026-09-15T18:00:00.000Z");
    assert.equal(payload.latitud, 19);
    assert.equal("estatus" in payload, false);
    assert.equal("coords" in payload, false);
    assert.equal("category" in payload, false);
    assert.equal("notas" in payload, false);
  });
});

describe("ApiClient", () => {
  it("adds Bearer only to administrative requests and normalizes FastAPI 422 errors", async () => {
    let headers: Headers | undefined;
    const client = new ApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: () => "token",
      fetchFn: async (_url, init) => {
        headers = new Headers(init?.headers);
        return new Response(
          JSON.stringify({
            detail: [
              {
                loc: ["body", "nombre"],
                msg: "Field required",
                type: "missing",
              },
            ],
          }),
          { status: 422, headers: { "content-type": "application/json" } },
        );
      },
    });
    await assert.rejects(
      client.request("/events", { access: "admin", method: "POST", body: {} }),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 422 &&
        error.fields.nombre?.[0]?.message === "Field required",
    );
    assert.equal(headers?.get("Authorization"), "Bearer token");
  });

  it("passes AbortSignal through public reads", async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | null | undefined;
    const api = new EventsApi(
      new ApiClient({
        baseUrl: "https://api.example.test",
        fetchFn: async (_url, init) => {
          receivedSignal = init?.signal;
          return new Response(JSON.stringify([response]), {
            headers: { "content-type": "application/json" },
          });
        },
      }),
    );
    await api.listPublic(controller.signal);
    assert.equal(receivedSignal, controller.signal);
  });
});
