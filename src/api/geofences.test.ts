import assert from "node:assert/strict";
import test from "node:test";
import {
  GeofencesApi,
  mapGeofence,
  toGeofenceFeatureCollection,
} from "./geofences";
import type { ApiClient } from "./http";

test("maps the geocerca API response and renders only available geometry", () => {
  const item = mapGeofence({
    id: "a",
    tipo: "MUNICIPIO",
    nombre: "Centro",
    codigo: "01",
    codigo_padre: null,
    fuente: "inegi",
    version: 2,
    vigente: true,
    geometry_simplified: null,
  });
  assert.equal(item.type, "MUNICIPIO");
  assert.equal(toGeofenceFeatureCollection([item]).features.length, 0);
});

test("listAll paginates until a page returns fewer than page_size items", async () => {
  const calls: string[] = [];
  const stubClient = {
    request<T>(path: string): Promise<T> {
      calls.push(path);
      const page = path.includes("page=2") ? 2 : 1;
      const batch = Array.from(
        { length: page === 1 ? 200 : 3 },
        (_, index) => ({
          id: `${page}-${index}`,
          tipo: "SECCION" as const,
          nombre: `S ${page}-${index}`,
          codigo: String(index),
          codigo_padre: null,
          fuente: "ine",
          version: 1,
          vigente: true,
          geometry_simplified: {
            type: "Polygon" as const,
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 0],
              ],
            ],
          },
        }),
      );
      return Promise.resolve(batch as T);
    },
  } as ApiClient;
  const api = new GeofencesApi(stubClient);
  const items = await api.listAll({ tipo: "SECCION" });
  assert.equal(items.length, 203);
  assert.equal(calls.length, 2);
  assert.match(calls[0], /tipo=SECCION/);
  assert.match(calls[1], /page=2/);
});
