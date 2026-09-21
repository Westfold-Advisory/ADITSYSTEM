import type { AuthenticatedRole, Person, PersonRole } from "@/types/domain";
import { PERSON_ROLES } from "@/types/domain";

export const AUTHENTICATABLE_ROLES = [
  "ADMIN",
  "COORDINADOR_GENERAL",
  "COORDINADOR",
  "ENLACE",
] as const satisfies readonly AuthenticatedRole[];

export type AuthenticatableRole = (typeof AUTHENTICATABLE_ROLES)[number];

export function isAuthenticatableRole(
  role: PersonRole,
): role is AuthenticatableRole {
  return role !== "AMIGO";
}

export function canCreateRole(
  actorRole: AuthenticatedRole,
  newRole: PersonRole,
): boolean {
  if (actorRole === "ADMIN") return true;
  if (actorRole === "COORDINADOR_GENERAL") {
    return newRole !== "ADMIN" && newRole !== "COORDINADOR_GENERAL";
  }
  if (actorRole === "COORDINADOR") {
    return newRole === "ENLACE" || newRole === "AMIGO";
  }
  if (actorRole === "ENLACE") return newRole === "AMIGO";
  return false;
}

export function creatableRolesFor(actorRole: AuthenticatedRole): PersonRole[] {
  return PERSON_ROLES.filter((role) => canCreateRole(actorRole, role));
}

export function canChangeCredentials(actorRole: AuthenticatedRole): boolean {
  return (
    actorRole === "ADMIN" ||
    actorRole === "COORDINADOR_GENERAL" ||
    actorRole === "COORDINADOR"
  );
}

const VALID_PARENT_ROLES: Partial<Record<PersonRole, readonly PersonRole[]>> = {
  COORDINADOR: ["COORDINADOR_GENERAL", "ADMIN"],
  ENLACE: ["COORDINADOR"],
  AMIGO: ["COORDINADOR", "ENLACE"],
};

function isRootOnlyRole(role: PersonRole): boolean {
  return role === "ADMIN" || role === "COORDINADOR_GENERAL";
}

export interface PersonCreateOption {
  role: PersonRole;
  parentId: string | null;
  parentPerson: Person | null;
}

/** UI mirror of PersonaPolicy.assert_create for the current tree selection. */
export function createOptionsForSelection(
  actorRole: AuthenticatedRole,
  selected: Person,
  actorPersonId: string,
): PersonCreateOption[] {
  const options: PersonCreateOption[] = [];

  for (const role of creatableRolesFor(actorRole)) {
    if (isRootOnlyRole(role)) {
      if (actorRole === "ADMIN" && selected.id === actorPersonId) {
        options.push({ role, parentId: null, parentPerson: null });
      }
      continue;
    }

    const allowedParents = VALID_PARENT_ROLES[role];
    if (!allowedParents?.includes(selected.role)) continue;

    if (actorRole === "ENLACE" && selected.id !== actorPersonId) continue;

    options.push({
      role,
      parentId: selected.id,
      parentPerson: selected,
    });
  }

  return options;
}

export const PASSWORD_MIN_LENGTH = 8;

export function validatePasswordFields(input: {
  password: string;
  confirmPassword: string;
  requirePassword: boolean;
}): { password?: string; confirmPassword?: string } {
  const errors: { password?: string; confirmPassword?: string } = {};
  const trimmed = input.password.trim();

  if (input.requirePassword) {
    if (!trimmed || trimmed.length < PASSWORD_MIN_LENGTH) {
      errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }
    if (trimmed !== input.confirmPassword.trim()) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  }

  return errors;
}

export function validateEmailForRole(
  email: string,
  role: PersonRole,
): string | undefined {
  if (!isAuthenticatableRole(role)) return undefined;
  const trimmed = email.trim();
  if (!trimmed) return "El correo electrónico es obligatorio para este rol.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Introduce un correo electrónico válido.";
  }
  return undefined;
}
