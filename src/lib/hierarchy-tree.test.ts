import assert from "node:assert/strict";
import test from "node:test";

import type { Person } from "@/types/domain";

import {
  buildVisibleTreeRows,
  countScopeNodes,
  seedWideHierarchy,
  sliceVirtualWindow,
  treeKeyboardAction,
  VIRTUALIZATION_SCOPE_THRESHOLD,
} from "./hierarchy-tree";

function person(overrides: Partial<Person>): Person {
  const baseDate = new Date("2026-01-01T00:00:00Z");
  return {
    id: "child",
    role: "ENLACE",
    parentId: "root",
    nombre: "Ana",
    apellidoPaterno: "Robles",
    apellidoMaterno: "Valdés",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: baseDate,
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

test("buildVisibleTreeRows respects expansion and depth", () => {
  const root = person({
    id: "root",
    role: "COORDINADOR_GENERAL",
    parentId: null,
  });
  const child = person({ id: "child", parentId: "root", role: "COORDINADOR" });
  const grandchild = person({ id: "grand", parentId: "child", role: "AMIGO" });
  const childrenById = {
    root: [child],
    child: [grandchild],
  };

  const collapsed = buildVisibleTreeRows(root, childrenById, {
    root: true,
    child: false,
  });
  assert.equal(collapsed.length, 2);
  assert.equal(collapsed[1].depth, 1);

  const expanded = buildVisibleTreeRows(root, childrenById, {
    root: true,
    child: true,
  });
  assert.equal(expanded.length, 3);
  assert.equal(expanded[2].person.id, "grand");
});

test("tree keyboard navigation follows WAI-ARIA tree arrows", () => {
  const root = person({
    id: "root",
    role: "COORDINADOR_GENERAL",
    parentId: null,
  });
  const a = person({ id: "a", parentId: "root" });
  const b = person({ id: "b", parentId: "root" });
  const rows = buildVisibleTreeRows(root, { root: [a, b] }, { root: true });

  assert.equal(treeKeyboardAction("Home", rows, 1).nextIndex, 0);
  assert.equal(treeKeyboardAction("End", rows, 0).nextIndex, 2);
  assert.equal(treeKeyboardAction("ArrowDown", rows, 0).nextIndex, 1);
  assert.equal(treeKeyboardAction("ArrowUp", rows, 2).nextIndex, 1);
  assert.equal(treeKeyboardAction("ArrowRight", rows, 0).nextIndex, 1);
  assert.equal(treeKeyboardAction("ArrowLeft", rows, 2).nextIndex, 0);
});

test("ArrowRight expands collapsed branch before moving to child", () => {
  const root = person({
    id: "root",
    role: "COORDINADOR_GENERAL",
    parentId: null,
  });
  const child = person({ id: "child", parentId: "root", role: "COORDINADOR" });
  const rows = buildVisibleTreeRows(root, { root: [child] }, { root: false });

  assert.deepEqual(treeKeyboardAction("ArrowRight", rows, 0), {
    nextIndex: 0,
    toggleExpand: "expand",
  });
});

test("countScopeNodes triggers virtualization threshold with wide seed", () => {
  const { root, childrenById } = seedWideHierarchy("root-wide", 250);
  const count = countScopeNodes(root, childrenById);
  assert.equal(count, 250);
  assert.ok(count >= VIRTUALIZATION_SCOPE_THRESHOLD);
});

test("buildVisibleTreeRows stays fast for 250-node seed", () => {
  const { root, childrenById } = seedWideHierarchy("perf-root", 250);
  const expanded = { "perf-root": true };
  const start = performance.now();
  const rows = buildVisibleTreeRows(root, childrenById, expanded);
  const elapsed = performance.now() - start;
  assert.equal(rows.length, 250);
  assert.ok(
    elapsed < 100,
    `expected flatten under 100ms, got ${elapsed.toFixed(1)}ms`,
  );
});

test("sliceVirtualWindow renders a bounded slice for long lists", () => {
  const window = sliceVirtualWindow(500, 720, 320);
  assert.ok(window.end - window.start < 40);
  assert.equal(window.offsetY, window.start * 36);
  assert.equal(window.totalHeight, 500 * 36);
});
