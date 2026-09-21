import { normalizePathname } from "@/lib/routing";

/** Navegación global de la consola admin (una sola fila; sin subnav duplicado). */
export const ADMIN_NAV_LINKS = [
  {
    href: "/admin/personas",
    label: "Personas",
    pageTitle: "Personas",
  },
  {
    href: "/admin/mapa",
    label: "Mapa de cobertura",
    pageTitle: "Mapa de cobertura",
  },
  { href: "/admin", label: "Eventos", pageTitle: "Eventos" },
] as const;

export function adminPageTitle(pathname: string): string {
  const current = normalizePathname(pathname);
  const match = ADMIN_NAV_LINKS.find((link) => link.href === current);
  return match?.pageTitle ?? "Administración";
}

export function adminNavIsActive(
  currentPath: string,
  href: (typeof ADMIN_NAV_LINKS)[number]["href"],
): boolean {
  return normalizePathname(currentPath) === href;
}
