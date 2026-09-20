import type { Person } from "@/types/domain";

/**
 * `GET /personas/{id}/descendientes` returns the full subtree (a recursive
 * query), not just one generation. The tree UI expands one level at a time,
 * so it must narrow that response to the immediate children of `parentId`.
 */
export function directChildren(
  people: Person[],
  parent: Pick<Person, "id" | "role">,
): Person[] {
  const children = people.filter((person) => person.parentId === parent.id);
  if (parent.role !== "ADMIN") {
    return children;
  }
  const seen = new Set(children.map((person) => person.id));
  for (const person of people) {
    if (
      person.parentId === null &&
      person.role === "COORDINADOR_GENERAL" &&
      !seen.has(person.id)
    ) {
      children.push(person);
      seen.add(person.id);
    }
  }
  return children;
}
