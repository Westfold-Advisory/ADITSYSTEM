import type { Person } from "@/types/domain";

function displayName(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

/** Personas cargadas en el scope actual (raíz + mapa de hijos). */
export function collectPeopleInScope(
  root: Person,
  childrenById: Record<string, Person[]>,
): Person[] {
  const byId = new Map<string, Person>();
  byId.set(root.id.toLowerCase(), root);
  for (const list of Object.values(childrenById)) {
    for (const person of list) {
      byId.set(person.id.toLowerCase(), person);
    }
  }
  return [...byId.values()];
}

export function sortPeopleByName(people: Person[]): Person[] {
  return [...people].sort((left, right) =>
    displayName(left).localeCompare(displayName(right), "es"),
  );
}

/** Filas del directorio global: excluye ADMIN como fila operativa. */
export function directoryRowsForActor(
  actor: Person,
  people: Person[],
): Person[] {
  const rows =
    actor.role === "ADMIN"
      ? people.filter((person) => person.role !== "ADMIN")
      : people.filter((person) => person.id !== actor.id);
  return sortPeopleByName(rows);
}

export function orgChartRoots(
  root: Person,
  childrenById: Record<string, Person[]>,
): Person[] {
  if (root.role === "ADMIN") {
    return sortPeopleByName(
      (childrenById[root.id] ?? []).filter((person) => person.role !== "ADMIN"),
    );
  }
  return [root];
}

/** Superiores presentes en el alcance cargado (filtro de listado/árbol). */
export function superiorFilterOptions(
  actor: Person,
  people: Person[],
): Person[] {
  const rows =
    actor.role === "ADMIN"
      ? people.filter((person) => person.role !== "ADMIN")
      : people.filter((person) => person.id !== actor.id);
  const parentIds = new Set<string>();
  for (const person of rows) {
    if (person.parentId) {
      parentIds.add(person.parentId.toLowerCase());
    }
  }
  return sortPeopleByName(
    people.filter(
      (person) =>
        person.role !== "ADMIN" && parentIds.has(person.id.toLowerCase()),
    ),
  );
}

export function parentDisplayName(
  person: Person,
  byId: Map<string, Person>,
): string {
  if (!person.parentId) return "—";
  const parent = byId.get(person.parentId.toLowerCase());
  if (!parent) return "—";
  if (parent.role === "ADMIN") return "—";
  return displayName(parent);
}
