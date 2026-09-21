import assert from "node:assert/strict";
import test from "node:test";

import type { Person } from "@/types/domain";

import {
  canCreateRole,
  createOptionsForSelection,
  validatePasswordFields,
} from "./person-provisioning";

function person(
  partial: Partial<Person> & Pick<Person, "id" | "role">,
): Person {
  return {
    nombre: "Ana",
    apellidoPaterno: "Pérez",
    apellidoMaterno: "López",
    telefono: "5550000000",
    parentId: null,
    status: "ACTIVO",
    registeredAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...partial,
  };
}

test("canCreateRole matches TRA-137 matrix", () => {
  assert.equal(canCreateRole("ADMIN", "ADMIN"), true);
  assert.equal(canCreateRole("COORDINADOR_GENERAL", "ADMIN"), false);
  assert.equal(canCreateRole("COORDINADOR_GENERAL", "ENLACE"), true);
  assert.equal(canCreateRole("COORDINADOR", "ENLACE"), true);
  assert.equal(canCreateRole("ENLACE", "AMIGO"), true);
  assert.equal(canCreateRole("ENLACE", "ENLACE"), false);
});

test("CG can register ENLACE when a COORDINADOR is selected", () => {
  const cgId = "cg-1";
  const coord = person({ id: "coord-1", role: "COORDINADOR", parentId: cgId });
  const options = createOptionsForSelection("COORDINADOR_GENERAL", coord, cgId);
  assert.ok(options.some((option) => option.role === "ENLACE"));
});

test("ENLACE only registers AMIGO under self", () => {
  const enlaceId = "enlace-1";
  const self = person({ id: enlaceId, role: "ENLACE" });
  const options = createOptionsForSelection("ENLACE", self, enlaceId);
  assert.deepEqual(
    options.map((option) => option.role),
    ["AMIGO"],
  );
});

test("validatePasswordFields enforces minimum length and confirmation", () => {
  assert.deepEqual(
    validatePasswordFields({
      password: "1234567",
      confirmPassword: "1234567",
      requirePassword: true,
    }),
    { password: "La contraseña debe tener al menos 8 caracteres." },
  );
  assert.deepEqual(
    validatePasswordFields({
      password: "12345678",
      confirmPassword: "87654321",
      requirePassword: true,
    }),
    { confirmPassword: "Las contraseñas no coinciden." },
  );
  assert.deepEqual(
    validatePasswordFields({
      password: "12345678",
      confirmPassword: "12345678",
      requirePassword: true,
    }),
    {},
  );
});
