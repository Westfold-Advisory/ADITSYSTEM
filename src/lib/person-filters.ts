import type { Person, PersonRole, PersonStatus } from "@/types/domain";

export type PersonStatusFilter = PersonStatus | "TODOS";
export type PersonRoleFilter = PersonRole | "TODOS";
export type PersonSuperiorFilter = string | "TODOS";

export interface PersonFilter {
  text: string;
  status: PersonStatusFilter;
  role: PersonRoleFilter;
  superiorId: PersonSuperiorFilter;
}

export const emptyPersonFilter: PersonFilter = {
  text: "",
  status: "TODOS",
  role: "TODOS",
  superiorId: "TODOS",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function fullName(person: Person): string {
  return normalize(
    [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
      .filter(Boolean)
      .join(" "),
  );
}

export function isPersonFilterActive(filter: PersonFilter): boolean {
  return (
    filter.text.trim().length > 0 ||
    filter.status !== "TODOS" ||
    filter.role !== "TODOS" ||
    filter.superiorId !== "TODOS"
  );
}

export function personMatchesFilter(
  person: Person,
  filter: PersonFilter,
): boolean {
  return filterPersonList([person], filter).length > 0;
}

export function filterPersonList(
  people: Person[],
  filter: PersonFilter,
): Person[] {
  const term = normalize(filter.text.trim());
  return people.filter((person) => {
    const matchesText = !term || fullName(person).includes(term);
    const matchesStatus =
      filter.status === "TODOS" || person.status === filter.status;
    const matchesRole = filter.role === "TODOS" || person.role === filter.role;
    const matchesSuperior =
      filter.superiorId === "TODOS" ||
      person.parentId?.toLowerCase() === filter.superiorId.toLowerCase();
    return matchesText && matchesStatus && matchesRole && matchesSuperior;
  });
}

/** Mantiene ramas que contienen coincidencias; evita mostrar solo la raíz vacía. */
export function filterChildMapForTree(
  root: Person,
  childrenById: Record<string, Person[]>,
  filter: PersonFilter,
): Record<string, Person[]> {
  if (!isPersonFilterActive(filter)) return childrenById;

  const byId = new Map<string, Person>();
  byId.set(root.id.toLowerCase(), root);
  for (const list of Object.values(childrenById)) {
    for (const person of list) {
      byId.set(person.id.toLowerCase(), person);
    }
  }

  function branchHasMatch(personId: string): boolean {
    const person = byId.get(personId.toLowerCase());
    if (!person) return false;
    if (personMatchesFilter(person, filter)) return true;
    for (const child of childrenById[person.id] ?? []) {
      if (branchHasMatch(child.id)) return true;
    }
    return false;
  }

  const next: Record<string, Person[]> = {};
  for (const [parentId, list] of Object.entries(childrenById)) {
    next[parentId] = list.filter((child) => branchHasMatch(child.id));
  }
  return next;
}

export function peopleInHierarchyScope(
  root: Person,
  childrenById: Record<string, Person[]>,
): Person[] {
  const all = [root, ...Object.values(childrenById).flat()];
  const byId = new Map<string, Person>();
  for (const person of all) {
    byId.set(person.id.toLowerCase(), person);
  }
  return [...byId.values()];
}

/** IDs de ancestros a expandir para mostrar todas las coincidencias del filtro. */
export function ancestorIdsToExpandForFilter(
  root: Person,
  childrenById: Record<string, Person[]>,
  filter: PersonFilter,
): string[] {
  if (!isPersonFilterActive(filter)) return [];
  const people = peopleInHierarchyScope(root, childrenById);
  const byId = new Map(
    people.map((person) => [person.id.toLowerCase(), person]),
  );
  const matches = filterPersonList(people, filter);
  const ids = new Set<string>();
  for (const match of matches) {
    for (const ancestorId of collectAncestorIds(match, byId)) {
      ids.add(ancestorId);
    }
  }
  return [...ids];
}

/**
 * Con filtro activo en el árbol, la ficha debe ser una coincidencia directa,
 * no un ancestro lejano (p. ej. ADMIN/CG) que ocultaba al match real.
 */
export function filterTreeSelectionTarget(
  root: Person,
  childrenById: Record<string, Person[]>,
  filter: PersonFilter,
  selected: Person | null,
): Person | null {
  if (!isPersonFilterActive(filter)) return selected;
  const people = peopleInHierarchyScope(root, childrenById);
  const matches = filterPersonList(people, filter);
  if (matches.length === 0) return selected;
  if (selected && matches.some((person) => person.id === selected.id)) {
    return selected;
  }
  return matches[0];
}

export function collectAncestorIds(
  person: Person,
  byId: Map<string, Person>,
): string[] {
  const ids: string[] = [];
  let parentId = person.parentId;
  while (parentId) {
    ids.push(parentId);
    const parent = byId.get(parentId.toLowerCase());
    if (!parent) break;
    parentId = parent.parentId;
  }
  return ids;
}
