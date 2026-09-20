import { normalizePathname } from "@/lib/routing";

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Eventos" },
  { href: "/admin/mapa", label: "Mapa de cobertura" },
  { href: "/admin/personas", label: "Estructura de personas" },
] as const;

export function adminNavIsActive(
  currentPath: string,
  href: (typeof ADMIN_NAV_LINKS)[number]["href"],
): boolean {
  return normalizePathname(currentPath) === href;
}
