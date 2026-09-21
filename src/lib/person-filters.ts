import type { Person, PersonStatus } from "@/types/domain";

export type PersonStatusFilter = PersonStatus | "TODOS";

export interface PersonFilter {
  text: string;
  status: PersonStatusFilter;
}

export const emptyPersonFilter: PersonFilter = { text: "", status: "TODOS" };

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
  return filter.text.trim().length > 0 || filter.status !== "TODOS";
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
    return matchesText && matchesStatus;
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
