import { ApiError } from "@/api/http";
import type { Person } from "@/types/domain";

export function apiErrorMessage(error: unknown): string {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export function nameOf(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

export { roleLabel } from "@/lib/role-label";
