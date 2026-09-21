import { CalendarDays, Map, Users, type LucideIcon } from "lucide-react";

import { ADMIN_NAV_LINKS, adminNavIsActive } from "@/lib/admin-nav";
import { normalizePathname } from "@/lib/routing";

const NAV_ICONS: Record<(typeof ADMIN_NAV_LINKS)[number]["href"], LucideIcon> =
  {
    "/admin/personas": Users,
    "/admin/mapa": Map,
    "/admin": CalendarDays,
  };

export function AdminNav({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const current = normalizePathname(window.location.pathname);
  const isSidebar = orientation === "vertical";

  return (
    <nav
      className={isSidebar ? "admin-nav-sidebar" : "admin-nav-tabs"}
      aria-label="Administración"
    >
      {isSidebar ? (
        <p className="admin-nav-sidebar__heading" id="admin-nav-modules">
          Módulos
        </p>
      ) : null}
      <ul
        className={
          isSidebar ? "admin-nav-sidebar__list" : "admin-nav-tabs__list"
        }
        aria-labelledby={isSidebar ? "admin-nav-modules" : undefined}
      >
        {ADMIN_NAV_LINKS.map((link) => {
          const active = adminNavIsActive(current, link.href);
          const Icon = NAV_ICONS[link.href];
          return (
            <li key={link.href}>
              <a
                href={link.href}
                className={
                  isSidebar ? "admin-nav-sidebar__link" : "admin-nav-tabs__tab"
                }
                aria-current={active ? "page" : undefined}
              >
                {isSidebar ? (
                  <Icon
                    size={18}
                    className="admin-nav-sidebar__icon"
                    aria-hidden
                  />
                ) : null}
                <span className="admin-nav-sidebar__label">{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
