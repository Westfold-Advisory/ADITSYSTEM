import assert from "node:assert/strict";
import test from "node:test";

import { capabilitiesFor } from "./capabilities";
import { canRegisterDocuments } from "./document-access";
import type { Person } from "@/types/domain";

const person = (
  overrides: Partial<Person> & Pick<Person, "id" | "role">,
): Person => ({
  id: overrides.id,
  role: overrides.role,
  parentId: overrides.parentId ?? null,
  nombre: overrides.nombre ?? "Nombre",
  apellidoPaterno: overrides.apellidoPaterno ?? "Ap",
  apellidoMaterno: overrides.apellidoMaterno ?? "Am",
  telefono: overrides.telefono ?? "555",
  status: overrides.status ?? "ACTIVO",
  registeredAt: overrides.registeredAt ?? new Date(),
});

test("canRegisterDocuments allows self and descendants for ENLACE", () => {
  const self = person({ id: "enlace", role: "ENLACE", parentId: "coord" });
  const amigo = person({ id: "amigo", role: "AMIGO", parentId: "enlace" });
  const known = new Map([
    [self.id, self],
    [amigo.id, amigo],
  ]);
  const caps = capabilitiesFor("ENLACE");
  assert.equal(canRegisterDocuments("ENLACE", caps, self, amigo, known), true);
  assert.equal(canRegisterDocuments("ENLACE", caps, self, self, known), true);
});

test("canRegisterDocuments denies siblings outside the subtree", () => {
  const self = person({ id: "enlace-a", role: "ENLACE", parentId: "coord" });
  const other = person({ id: "enlace-b", role: "ENLACE", parentId: "coord" });
  const known = new Map([
    [self.id, self],
    [other.id, other],
  ]);
  const caps = capabilitiesFor("ENLACE");
  assert.equal(canRegisterDocuments("ENLACE", caps, self, other, known), false);
});

test("canRegisterDocuments allows ADMIN on any target", () => {
  const admin = person({ id: "admin", role: "ADMIN" });
  const target = person({ id: "other", role: "COORDINADOR" });
  const caps = capabilitiesFor("ADMIN");
  assert.equal(
    canRegisterDocuments("ADMIN", caps, admin, target, new Map()),
    true,
  );
});
