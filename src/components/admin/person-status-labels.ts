import type { PersonStatus } from "@/types/domain";

export const personStatusLabels: Record<PersonStatus, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  BAJA: "Baja",
};

export function personStatusSlug(status: PersonStatus): string {
  return status.toLowerCase();
}
