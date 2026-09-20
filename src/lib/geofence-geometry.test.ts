import assert from "node:assert/strict";
import test from "node:test";

import {
  boundsFromGeometry,
  geofenceMatchesSearch,
} from "@/lib/geofence-geometry";

test("boundsFromGeometry returns lng/lat bounds for a polygon", () => {
  const bounds = boundsFromGeometry({
    type: "Polygon",
    coordinates: [
      [
        [-98.5, 19.0],
        [-98.0, 19.0],
        [-98.0, 19.5],
        [-98.5, 19.0],
      ],
    ],
  });
  assert.deepEqual(bounds, [
    [-98.5, 19.0],
    [-98.0, 19.5],
  ]);
});

test("geofenceMatchesSearch is accent-insensitive", () => {
  assert.equal(
    geofenceMatchesSearch(
      { name: "Puebla", code: "140", type: "MUNICIPIO" },
      "puebla",
    ),
    true,
  );
});
