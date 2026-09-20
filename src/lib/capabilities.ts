import type { AuthenticatedRole, PersonRole } from "@/types/domain";

export interface Capabilities {
  canManageEvents: boolean;
  canViewStructure: boolean;
  canCreateChild: boolean;
  childRole: Exclude<PersonRole, "ADMIN"> | null;
  canManageOwnDocuments: boolean;
}

const capabilitiesByRole: Record<AuthenticatedRole, Capabilities> = {
  ADMIN: {
    canManageEvents: true,
    canViewStructure: true,
    canCreateChild: true,
    childRole: "COORDINADOR_GENERAL",
    canManageOwnDocuments: true,
  },
  COORDINADOR_GENERAL: {
    canManageEvents: true,
    canViewStructure: true,
    canCreateChild: true,
    childRole: "COORDINADOR",
    canManageOwnDocuments: true,
  },
  COORDINADOR: {
    canManageEvents: true,
    canViewStructure: true,
    canCreateChild: true,
    childRole: "ENLACE",
    canManageOwnDocuments: true,
  },
  ENLACE: {
    canManageEvents: true,
    canViewStructure: true,
    canCreateChild: true,
    childRole: "AMIGO",
    canManageOwnDocuments: true,
  },
};

/** UI affordances only; every request remains enforced by PersonaPolicy in the API. */
export function capabilitiesFor(role: AuthenticatedRole): Capabilities {
  return capabilitiesByRole[role];
}
