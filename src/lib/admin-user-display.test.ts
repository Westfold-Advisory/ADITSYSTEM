import assert from "node:assert/strict";
import test from "node:test";

import {
  adminUserDisplayName,
  adminUserInitials,
} from "@/lib/admin-user-display";

test("adminUserDisplayName prefers persona legal name", () => {
  assert.equal(
    adminUserDisplayName("ops@example.com", {
      nombre: "María",
      apellidoPaterno: "López",
      apellidoMaterno: "Ruiz",
    }),
    "María López Ruiz",
  );
});

test("adminUserDisplayName derives readable label from email", () => {
  assert.equal(
    adminUserDisplayName("ervic.perez@institucion.gob.mx"),
    "Ervic Perez",
  );
});

test("adminUserInitials uses first two tokens", () => {
  assert.equal(adminUserInitials("Ervic Pérez Mendoza"), "EP");
});
