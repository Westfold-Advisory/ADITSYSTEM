import { adminNavIsActive } from "@/lib/admin-nav";
import { normalizePathname } from "@/lib/routing";

const VIEWS = [
  {
    href: "/admin/personas",
    label: "Directorio",
    description: "Lista jerárquica y detalle de personas",
  },
  {
    href: "/admin/mapa",
    label: "Vista en mapa",
    description: "Cobertura territorial y pines en el mapa",
  },
] as const;

export function StructureViewTabs() {
  const current = normalizePathname(window.location.pathname);
  return (
    <nav className="admin-section-tabs" aria-label="Vistas de la estructura">
      {VIEWS.map((view) => {
        const active = adminNavIsActive(current, view.href);
        return (
          <a
            key={view.href}
            href={view.href}
            className="admin-section-tabs__tab"
            aria-current={active ? "page" : undefined}
            title={view.description}
          >
            {view.label}
          </a>
        );
      })}
    </nav>
  );
}
