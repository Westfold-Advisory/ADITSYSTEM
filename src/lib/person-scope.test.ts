import assert from "node:assert/strict";
import test from "node:test";

import type { Person } from "@/types/domain";

import {
  collectPeopleInScope,
  directoryRowsForActor,
  orgChartRoots,
  superiorFilterOptions,
} from "./person-scope";

function person(overrides: Partial<Person>): Person {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    role: "ENLACE",
    parentId: null,
    nombre: "Ana",
    apellidoPaterno: "Robles",
    apellidoMaterno: "Valdés",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

test("person scope helpers", async (t) => {
  await t.test("collectPeopleInScope deduplicates", () => {
    const root = person({ id: "root", role: "COORDINADOR_GENERAL" });
    const child = person({ id: "child", parentId: "root" });
    const map = { [root.id]: [child] };
    const all = collectPeopleInScope(root, map);
    assert.equal(all.length, 2);
  });

  await t.test("directoryRowsForActor omits ADMIN for admin actor", () => {
    const admin = person({ id: "admin", role: "ADMIN" });
    const cg = person({ id: "cg", role: "COORDINADOR_GENERAL" });
    const rows = directoryRowsForActor(admin, [admin, cg]);
    assert.deepEqual(
      rows.map((p) => p.id),
      [cg.id],
    );
  });

  await t.test("orgChartRoots for ADMIN uses top-level CG nodes", () => {
    const admin = person({ id: "admin", role: "ADMIN" });
    const cg = person({
      id: "cg",
      role: "COORDINADOR_GENERAL",
      parentId: null,
    });
    const roots = orgChartRoots(admin, { [admin.id]: [cg] });
    assert.deepEqual(
      roots.map((p) => p.id),
      [cg.id],
    );
  });

  await t.test("superiorFilterOptions lists parents in scope", () => {
    const actor = person({ id: "actor", role: "COORDINADOR_GENERAL" });
    const coord = person({
      id: "coord",
      role: "COORDINADOR",
      parentId: "actor",
      nombre: "Beto",
    });
    const enlace = person({
      id: "enlace",
      role: "ENLACE",
      parentId: "coord",
      nombre: "Carla",
    });
    const people = [actor, coord, enlace];
    const options = superiorFilterOptions(actor, people);
    assert.deepEqual(
      options.map((p) => p.id),
      ["actor", "coord"],
    );
  });
});
