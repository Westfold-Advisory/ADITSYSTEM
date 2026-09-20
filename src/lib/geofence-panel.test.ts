import assert from "node:assert/strict";
import test from "node:test";

import type { Geofence } from "@/api/geofences";
import { filterGeofencesForPanelList } from "@/lib/geofence-panel";

const visible = {
  ESTADO: false,
  MUNICIPIO: true,
  DISTRITO: false,
  SECCION: false,
  DISTRITO_LOCAL: true,
  DISTRITO_FEDERAL: false,
} as const;

function item(
  partial: Partial<Geofence> & Pick<Geofence, "id" | "type" | "name">,
): Geofence {
  return {
    code: null,
    parentCode: null,
    source: "test",
    version: 1,
    active: true,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
    ...partial,
  };
}

test("filterGeofencesForPanelList respects visible layers and search", () => {
  const items = [
    item({ id: "1", type: "MUNICIPIO", name: "Puebla" }),
    item({ id: "2", type: "MUNICIPIO", name: "Atlixco" }),
    item({ id: "3", type: "DISTRITO_LOCAL", name: "Distrito 5" }),
    item({ id: "4", type: "ESTADO", name: "Puebla estado" }),
  ];
  const result = filterGeofencesForPanelList({
    items,
    visible: { ...visible, ESTADO: true },
    listScope: "ALL",
    search: "pue",
  });
  assert.equal(result.items.length, 2);
  assert.ok(
    result.items.every((entry) =>
      entry.name.toLocaleLowerCase().includes("pue"),
    ),
  );
});

test("filterGeofencesForPanelList scopes to one tipo", () => {
  const items = [
    item({ id: "1", type: "MUNICIPIO", name: "Puebla" }),
    item({ id: "2", type: "DISTRITO_LOCAL", name: "Distrito 5" }),
  ];
  const result = filterGeofencesForPanelList({
    items,
    visible,
    listScope: "DISTRITO_LOCAL",
    search: "",
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0]?.type, "DISTRITO_LOCAL");
});
