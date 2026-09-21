import type { Capabilities } from "@/lib/capabilities";
import type { Person } from "@/types/domain";
import type { UUID } from "@/types/events";

export type GetPersonFn = (
  id: UUID,
  options?: { signal?: AbortSignal },
) => Promise<Person>;

/** Breadcrumb from selected person up through known nodes (tree or ancestor chain). */
export function buildPersonBreadcrumb(
  selected: Person,
  knownById: Map<string, Person>,
): Person[] {
  const path: Person[] = [];
  for (
    let current: Person | undefined = selected;
    current;
    current = current.parentId ? knownById.get(current.parentId) : undefined
  ) {
    path.unshift(current);
  }
  return path.length ? path : [selected];
}

/** Same rule as DomainAdminPage — backend remains authoritative. */
export function canManagePerson(
  person: Person,
  self: Person | null,
  capabilities: Capabilities,
): boolean {
  return (
    person.id === self?.id ||
    (capabilities.canCreateChild && person.role === capabilities.childRole)
  );
}

export function buildKnownPersonsForDocumentAccess(
  self: Person | null,
  selected: Person | null,
  ancestors: Person[],
): Map<string, Person> {
  const map = new Map<string, Person>();
  if (self) map.set(self.id, self);
  for (const ancestor of ancestors) map.set(ancestor.id, ancestor);
  if (selected) map.set(selected.id, selected);
  return map;
}

/** Walk parentId via getPerson until root (for map pin selection without tree cache). */
export async function loadPersonAncestorChain(
  getPerson: GetPersonFn,
  target: Person,
  signal?: AbortSignal,
): Promise<Person[]> {
  const ancestors: Person[] = [];
  let current: Person | undefined = target;
  while (current?.parentId) {
    const parent = await getPerson(
      current.parentId,
      signal ? { signal } : undefined,
    );
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}
