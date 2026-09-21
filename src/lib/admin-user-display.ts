import type { Person } from "@/types/domain";

/** Nombre visible en sidebar admin cuando aún no hay persona cargada. */
export function adminUserDisplayName(
  email: string,
  person?: Pick<
    Person,
    "nombre" | "apellidoPaterno" | "apellidoMaterno"
  > | null,
): string {
  if (person) {
    const full = [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (full) return full;
  }
  const local = email.split("@")[0]?.trim();
  if (!local) return email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function adminUserInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
}
