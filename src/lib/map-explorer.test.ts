import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getMobileMapSheetState,
  initialGeofenceVisibility,
} from "./map-explorer";

describe("map explorer interaction state", () => {
  it("keeps every territorial layer opt-in by default", () =>
    assert.deepEqual(initialGeofenceVisibility, {
      ESTADO: false,
      MUNICIPIO: false,
      DISTRITO: false,
      SECCION: false,
      DISTRITO_LOCAL: false,
      DISTRITO_FEDERAL: false,
    }));

  it("transitions the mobile sheet between closed, list, and detail", () => {
    assert.equal(getMobileMapSheetState(false, null), "closed");
    assert.equal(getMobileMapSheetState(true, null), "list");
    assert.equal(getMobileMapSheetState(true, "event-1"), "detail");
  });
});
