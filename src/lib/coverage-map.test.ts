import assert from "node:assert/strict";
import test from "node:test";

import { filterCoveragePins } from "./coverage-map";
import type { CoverageMapPin } from "@/types/domain";

const pins: CoverageMapPin[] = [
  {
    personId: "1",
    role: "ENLACE",
    nombre: "Ana",
    apellidoPaterno: "López",
    apellidoMaterno: "Ruiz",
    latitude: 19,
    longitude: -98,
  },
  {
    personId: "2",
    role: "AMIGO",
    nombre: "Bruno",
    apellidoPaterno: "Pérez",
    apellidoMaterno: "",
    latitude: 19.1,
    longitude: -98.1,
  },
];

test("filterCoveragePins filters by role and search", () => {
  assert.equal(filterCoveragePins(pins, "AMIGO", "").length, 1);
  assert.equal(filterCoveragePins(pins, "ALL", "ana").length, 1);
  assert.equal(filterCoveragePins(pins, "ENLACE", "bruno").length, 0);
});
