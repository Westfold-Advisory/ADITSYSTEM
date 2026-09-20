import type { Person } from "@/types/domain";

function samePersonId(left: string | null, right: string): boolean {
  if (left === null) return false;
  return left.toLowerCase() === right.toLowerCase();
}

/**
 * `GET /personas/{id}/descendientes` returns the full subtree (a recursive
 * query), not just one generation. The tree UI expands one level at a time,
 * so it must narrow that response to the immediate children of `parentId`.
 */
export function directChildren(
  people: Person[],
  parent: Pick<Person, "id" | "role">,
): Person[] {
  const children = people.filter((person) =>
    samePersonId(person.parentId, parent.id),
  );
  if (parent.role !== "ADMIN") {
    return children;
  }
  const seen = new Set(children.map((person) => person.id.toLowerCase()));
  for (const person of people) {
    if (
      person.parentId === null &&
      person.role === "COORDINADOR_GENERAL" &&
      !seen.has(person.id.toLowerCase())
    ) {
      children.push(person);
      seen.add(person.id.toLowerCase());
    }
  }
  return children;
}

/** Precompute immediate children for every parent referenced in `scope`. */
export function buildChildMap(
  anchor: Person,
  scope: Person[],
): Record<string, Person[]> {
  const byId = new Map<string, Person>();
  byId.set(anchor.id.toLowerCase(), anchor);
  for (const person of scope) {
    byId.set(person.id.toLowerCase(), person);
  }

  const parentIds = new Set<string>([anchor.id.toLowerCase()]);
  for (const person of scope) {
    if (person.parentId) parentIds.add(person.parentId.toLowerCase());
  }

  const map: Record<string, Person[]> = {};
  for (const parentKey of parentIds) {
    const parent = byId.get(parentKey);
    if (!parent) continue;
    map[parent.id] = directChildren(scope, parent);
  }
  return map;
}

export function mergePersonScope(
  anchor: Person,
  current: Record<string, Person[]>,
  fetched: Person[],
): Person[] {
  const merged = new Map<string, Person>();
  merged.set(anchor.id.toLowerCase(), anchor);
  for (const list of Object.values(current)) {
    for (const person of list) {
      merged.set(person.id.toLowerCase(), person);
    }
  }
  for (const person of fetched) {
    merged.set(person.id.toLowerCase(), person);
  }
  return [...merged.values()];
}
