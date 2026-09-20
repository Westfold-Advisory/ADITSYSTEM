import assert from "node:assert/strict";
import test from "node:test";

import { buildChildMap, directChildren } from "./hierarchy";
import type { Person } from "@/types/domain";

function person(overrides: Partial<Person>): Person {
  return {
    id: "child",
    role: "ENLACE",
    parentId: "root",
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

test("directChildren narrows a recursive descendants response to one generation", () => {
  const child = person({ id: "child", parentId: "root", role: "COORDINADOR" });
  const grandchild = person({
    id: "grandchild",
    parentId: "child",
    role: "ENLACE",
  });
  const greatGrandchild = person({
    id: "great-grandchild",
    parentId: "grandchild",
    role: "AMIGO",
  });

  const result = directChildren([child, grandchild, greatGrandchild], {
    id: "root",
    role: "COORDINADOR_GENERAL",
  });

  assert.deepEqual(result, [child]);
});

test("returns an empty list for a leaf with no descendants", () => {
  assert.deepEqual(directChildren([], { id: "root", role: "ENLACE" }), []);
});

test("admin tree includes root coordinadores generales as immediate children", () => {
  const admin = person({ id: "admin", role: "ADMIN", parentId: null });
  const general = person({
    id: "general",
    role: "COORDINADOR_GENERAL",
    parentId: null,
    nombre: "Beto",
  });
  const coordinator = person({
    id: "coord",
    role: "COORDINADOR",
    parentId: "general",
  });

  const result = directChildren([general, coordinator], admin);

  assert.deepEqual(result, [general]);
});

test("buildChildMap indexes every parent from one descendants payload", () => {
  const admin = person({ id: "admin", role: "ADMIN", parentId: null });
  const general = person({
    id: "general",
    role: "COORDINADOR_GENERAL",
    parentId: null,
  });
  const coordinator = person({
    id: "coord",
    role: "COORDINADOR",
    parentId: "general",
  });
  const link = person({
    id: "link",
    role: "ENLACE",
    parentId: "coord",
  });

  const map = buildChildMap(admin, [general, coordinator, link]);

  assert.deepEqual(map[admin.id], [general]);
  assert.deepEqual(map[general.id], [coordinator]);
  assert.deepEqual(map[coordinator.id], [link]);
});
