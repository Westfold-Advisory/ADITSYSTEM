import type { Person } from "@/types/domain";
import type { UUID } from "@/types/events";

/**
 * `GET /personas/{id}/descendientes` returns the full subtree (a recursive
 * query), not just one generation. The tree UI expands one level at a time,
 * so it must narrow that response to the immediate children of `parentId`.
 */
export function directChildren(people: Person[], parentId: UUID): Person[] {
  return people.filter((person) => person.parentId === parentId);
}
