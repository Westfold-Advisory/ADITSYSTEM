import type { AuthenticatedRole, Person } from "@/types/domain";

import type { Capabilities } from "./capabilities";

/** UI affordance aligned with PersonaPolicy.assert_manage; API remains authoritative. */
export function canRegisterDocuments(
  role: AuthenticatedRole,
  capabilities: Capabilities,
  self: Person,
  target: Person,
  knownPersons: Map<string, Person>,
): boolean {
  if (!capabilities.canManageOwnDocuments) return false;
  if (role === "ADMIN") return true;
  if (target.id === self.id) return true;

  let current: Person | undefined = target;
  while (current) {
    if (current.id === self.id) return true;
    current = current.parentId ? knownPersons.get(current.parentId) : undefined;
  }
  return false;
}
