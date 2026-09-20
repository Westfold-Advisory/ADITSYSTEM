import type { Person } from "@/types/domain";

/** Activa ventana virtual cuando el scope acumulado supera este umbral. */
export const VIRTUALIZATION_SCOPE_THRESHOLD = 200;

export const TREE_ROW_HEIGHT_PX = 36;
export const TREE_VIRTUAL_OVERSCAN = 5;

export type TreeRow = {
  person: Person;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
};

export type TreeNavigationKey =
  "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight" | "Home" | "End";

export type TreeKeyboardResult = {
  nextIndex: number;
  toggleExpand?: "expand" | "collapse";
};

export function countScopeNodes(
  root: Person,
  childrenById: Record<string, Person[]>,
): number {
  const seen = new Set<string>([root.id.toLowerCase()]);
  for (const list of Object.values(childrenById)) {
    for (const person of list) {
      seen.add(person.id.toLowerCase());
    }
  }
  return seen.size;
}

export function buildVisibleTreeRows(
  root: Person,
  childrenById: Record<string, Person[]>,
  expandedById: Record<string, boolean>,
): TreeRow[] {
  const rows: TreeRow[] = [];

  function visit(person: Person, depth: number) {
    const hasChildren = person.role !== "AMIGO";
    const expanded = hasChildren && Boolean(expandedById[person.id]);
    rows.push({ person, depth, hasChildren, expanded });
    if (!expanded) return;
    for (const child of childrenById[person.id] ?? []) {
      visit(child, depth + 1);
    }
  }

  visit(root, 0);
  return rows;
}

function parentRowIndex(rows: TreeRow[], index: number): number {
  const parentId = rows[index]?.person.parentId?.toLowerCase() ?? null;
  if (!parentId) return 0;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (rows[i].person.id.toLowerCase() === parentId) return i;
  }
  return 0;
}

export function treeKeyboardAction(
  key: TreeNavigationKey,
  rows: TreeRow[],
  focusedIndex: number,
): TreeKeyboardResult {
  if (rows.length === 0) return { nextIndex: 0 };

  const row = rows[focusedIndex];
  if (!row) return { nextIndex: Math.min(focusedIndex, rows.length - 1) };

  switch (key) {
    case "Home":
      return { nextIndex: 0 };
    case "End":
      return { nextIndex: rows.length - 1 };
    case "ArrowDown":
      return { nextIndex: Math.min(focusedIndex + 1, rows.length - 1) };
    case "ArrowUp":
      return { nextIndex: Math.max(focusedIndex - 1, 0) };
    case "ArrowRight":
      if (row.hasChildren && !row.expanded) {
        return { nextIndex: focusedIndex, toggleExpand: "expand" };
      }
      if (row.hasChildren && row.expanded && focusedIndex < rows.length - 1) {
        return { nextIndex: focusedIndex + 1 };
      }
      return { nextIndex: focusedIndex };
    case "ArrowLeft":
      if (row.hasChildren && row.expanded) {
        return { nextIndex: focusedIndex, toggleExpand: "collapse" };
      }
      return { nextIndex: parentRowIndex(rows, focusedIndex) };
    default:
      return { nextIndex: focusedIndex };
  }
}

export type VirtualWindow = {
  start: number;
  end: number;
  offsetY: number;
  totalHeight: number;
};

export function sliceVirtualWindow(
  rowCount: number,
  scrollTop: number,
  viewportHeight: number,
  rowHeight = TREE_ROW_HEIGHT_PX,
  overscan = TREE_VIRTUAL_OVERSCAN,
): VirtualWindow {
  if (rowCount === 0) {
    return { start: 0, end: 0, offsetY: 0, totalHeight: 0 };
  }
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleRows = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
  const end = Math.min(rowCount, start + visibleRows);
  return {
    start,
    end,
    offsetY: start * rowHeight,
    totalHeight: rowCount * rowHeight,
  };
}

/** Genera un scope ancho para pruebas de rendimiento (sin tocar API). */
export function seedWideHierarchy(
  rootId: string,
  nodeCount: number,
): { root: Person; childrenById: Record<string, Person[]> } {
  const baseDate = new Date("2026-01-01T00:00:00Z");
  const root: Person = {
    id: rootId,
    role: "COORDINADOR_GENERAL",
    parentId: null,
    nombre: "Raíz",
    apellidoPaterno: "Prueba",
    apellidoMaterno: "",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: baseDate,
    createdAt: baseDate,
    updatedAt: baseDate,
  };

  const children: Person[] = [];
  for (let i = 0; i < nodeCount - 1; i += 1) {
    children.push({
      id: `node-${i}`,
      role: i % 4 === 3 ? "AMIGO" : "ENLACE",
      parentId: rootId,
      nombre: `Persona ${i}`,
      apellidoPaterno: "Seed",
      apellidoMaterno: "",
      telefono: "5555555555",
      status: "ACTIVO",
      registeredAt: baseDate,
      createdAt: baseDate,
      updatedAt: baseDate,
    });
  }

  return {
    root,
    childrenById: { [rootId]: children },
  };
}
