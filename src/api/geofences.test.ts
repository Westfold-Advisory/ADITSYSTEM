import assert from "node:assert/strict";
import test from "node:test";
import { mapGeofence, toGeofenceFeatureCollection } from "./geofences";

test("maps the geocerca API response and renders only available geometry", () => {
  const item = mapGeofence({ id: "a", tipo: "MUNICIPIO", nombre: "Centro", codigo: "01", codigo_padre: null, fuente: "inegi", version: 2, vigente: true, geometry_simplified: null });
  assert.equal(item.type, "MUNICIPIO");
  assert.equal(toGeofenceFeatureCollection([item]).features.length, 0);
});
