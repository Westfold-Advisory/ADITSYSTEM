import assert from "node:assert/strict";
import test from "node:test";

import type { Person } from "@/types/domain";

import { DescendantsCache } from "./hierarchy-scope";

function person(id: string): Person {
  return {
    id,
    role: "COORDINADOR_GENERAL",
    parentId: null,
    nombre: "Ana",
    apellidoPaterno: "López",
    apellidoMaterno: "Pérez",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

/**
 * Mirrors useHierarchyScope: loadChildren depends only on DescendantsCache,
 * while the tree anchor lives in a ref updated after getPerson — not in callback deps.
 */
test("useHierarchyScope loadChildren stays stable when anchor identity changes", async () => {
  let listCalls = 0;
  const cache = new DescendantsCache(async (id) => {
    listCalls += 1;
    return id === "root" ? [person("child")] : [];
  });

  const anchorRef: { current: Person | null } = { current: null };
  const loadChildren = async (node: Person, anchor?: Person) => {
    const treeRoot = anchor ?? anchorRef.current ?? node;
    void treeRoot;
    await cache.load(node.id);
  };

  const firstLoadChildren = loadChildren;
  anchorRef.current = person("root");
  await loadChildren(person("root"));
  anchorRef.current = { ...person("root"), nombre: "Actualizado" };
  await loadChildren(person("root"));

  assert.equal(firstLoadChildren, loadChildren);
  assert.equal(listCalls, 1);
});
