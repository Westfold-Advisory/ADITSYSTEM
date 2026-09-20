import type { GeofenceType } from "@/api/geofences";
import type { CoverageMapPin, PersonRole } from "@/types/domain";

export type CoverageRoleFilter = "ALL" | PersonRole;

export const COVERAGE_ROLE_FILTERS: CoverageRoleFilter[] = [
  "ALL",
  "COORDINADOR_GENERAL",
  "COORDINADOR",
  "ENLACE",
  "AMIGO",
];

export const coverageRoleFilterLabel: Record<CoverageRoleFilter, string> = {
  ALL: "Todos",
  COORDINADOR_GENERAL: "Coordinador general",
  COORDINADOR: "Coordinador",
  ENLACE: "Enlace",
  AMIGO: "Amigo",
  ADMIN: "Admin",
};

export const initialCoverageGeofenceVisibility: Record<GeofenceType, boolean> =
  {
    ESTADO: false,
    MUNICIPIO: false,
    DISTRITO: false,
    SECCION: false,
    DISTRITO_LOCAL: true,
    DISTRITO_FEDERAL: false,
  };

export function filterCoveragePins(
  pins: CoverageMapPin[],
  roleFilter: CoverageRoleFilter,
  search: string,
): CoverageMapPin[] {
  const term = search.trim().toLocaleLowerCase("es-MX");
  return pins.filter((pin) => {
    if (roleFilter !== "ALL" && pin.role !== roleFilter) return false;
    if (!term) return true;
    const fullName = [pin.nombre, pin.apellidoPaterno, pin.apellidoMaterno]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("es-MX");
    return fullName.includes(term);
  });
}

export function pinColorForRole(role: PersonRole): string {
  switch (role) {
    case "COORDINADOR_GENERAL":
      return "#7c3aed";
    case "COORDINADOR":
      return "#2563eb";
    case "ENLACE":
      return "#0d9488";
    case "AMIGO":
      return "#ca8a04";
    case "ADMIN":
      return "#64748b";
    default:
      return "var(--md-sys-color-primary)";
  }
}
