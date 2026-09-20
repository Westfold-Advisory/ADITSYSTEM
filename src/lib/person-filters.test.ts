import assert from "node:assert/strict";
import test from "node:test";

import {
  emptyPersonFilter,
  filterPersonList,
  isPersonFilterActive,
} from "./person-filters";
import type { Person } from "@/types/domain";

function person(overrides: Partial<Person>): Person {
  return {
    id: "00000000-0000-0000-0000-000000000000",
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

test("person filters", async (t) => {
  await t.test("an empty filter is inactive and keeps every person", () => {
    const people = [person({ nombre: "Ana" }), person({ nombre: "Beto" })];
    assert.equal(isPersonFilterActive(emptyPersonFilter), false);
    assert.deepEqual(filterPersonList(people, emptyPersonFilter), people);
  });

  await t.test("matches by name case- and accent-insensitively", () => {
    const target = person({ nombre: "María", apellidoPaterno: "López" });
    const other = person({ nombre: "Carlos", apellidoPaterno: "Ruiz" });
    const result = filterPersonList([target, other], {
      text: "MARIA lop",
      status: "TODOS",
    });
    assert.deepEqual(result, [target]);
  });

  await t.test("matches by status", () => {
    const active = person({ status: "ACTIVO" });
    const inactive = person({ status: "INACTIVO" });
    const baja = person({ status: "BAJA" });
    const result = filterPersonList([active, inactive, baja], {
      text: "",
      status: "INACTIVO",
    });
    assert.deepEqual(result, [inactive]);
  });

  await t.test("combines text and status filters", () => {
    const match = person({ nombre: "Sofía", status: "ACTIVO" });
    const wrongStatus = person({ nombre: "Sofía", status: "BAJA" });
    const wrongName = person({ nombre: "Diego", status: "ACTIVO" });
    const result = filterPersonList([match, wrongStatus, wrongName], {
      text: "sofía",
      status: "ACTIVO",
    });
    assert.deepEqual(result, [match]);
  });

  await t.test("a non-empty text or non-default status is active", () => {
    assert.equal(isPersonFilterActive({ text: "  ", status: "TODOS" }), false);
    assert.equal(isPersonFilterActive({ text: "ana", status: "TODOS" }), true);
    assert.equal(isPersonFilterActive({ text: "", status: "ACTIVO" }), true);
  });
});
