import assert from "node:assert/strict";
import test from "node:test";

import { capabilitiesFor } from "@/lib/capabilities";
import type { Person } from "@/types/domain";

import {
  buildPersonBreadcrumb,
  buildKnownPersonsForDocumentAccess,
  canManagePerson,
  loadPersonAncestorChain,
} from "./person-detail-context";

function person(
  id: string,
  parentId: string | null,
  role: Person["role"] = "ENLACE",
): Person {
  return {
    id,
    role,
    parentId,
    nombre: id,
    apellidoPaterno: "Test",
    apellidoMaterno: "User",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

test("buildPersonBreadcrumb walks known parent chain", () => {
  const root = person("root", null, "COORDINADOR_GENERAL");
  const mid = person("mid", "root", "COORDINADOR");
  const leaf = person("leaf", "mid", "ENLACE");
  const known = new Map([
    [root.id, root],
    [mid.id, mid],
    [leaf.id, leaf],
  ]);
  assert.deepEqual(buildPersonBreadcrumb(leaf, known), [root, mid, leaf]);
});

test("canManagePerson matches self and direct child role", () => {
  const self = person("self", null, "ENLACE");
  const child = person("child", "self", "AMIGO");
  const caps = capabilitiesFor("ENLACE");
  assert.equal(canManagePerson(self, self, caps), true);
  assert.equal(canManagePerson(child, self, caps), true);
  assert.equal(
    canManagePerson(person("other", null, "COORDINADOR"), self, caps),
    false,
  );
});

test("loadPersonAncestorChain fetches parents in order", async () => {
  const root = person("root", null);
  const mid = person("mid", "root");
  const leaf = person("leaf", "mid");
  const calls: string[] = [];
  const chain = await loadPersonAncestorChain(async (id) => {
    calls.push(id);
    if (id === "root") return root;
    if (id === "mid") return mid;
    throw new Error("missing");
  }, leaf);
  assert.deepEqual(chain, [root, mid]);
  assert.deepEqual(calls, ["mid", "root"]);
});

test("buildKnownPersonsForDocumentAccess includes self, ancestors and selected", () => {
  const self = person("self", null);
  const mid = person("mid", "self");
  const selected = person("sel", "mid");
  const map = buildKnownPersonsForDocumentAccess(self, selected, [mid]);
  assert.ok(map.has("self"));
  assert.ok(map.has("mid"));
  assert.ok(map.has("sel"));
});
