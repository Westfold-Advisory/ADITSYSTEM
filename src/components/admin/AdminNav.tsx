import { Building2, CalendarDays, Map, type LucideIcon } from "lucide-react";

import {
  ORGANIZATION_STRUCTURE_VIEWS,
  type PersonasStructureView,
} from "@/components/admin/organization-structure-views";
import { useAdminOrganizationNav } from "@/components/admin/admin-organization-nav-context";
import { useAdminSidebarCompact } from "@/components/admin/admin-sidebar-context";
import { ADMIN_NAV_LINKS, adminNavIsActive } from "@/lib/admin-nav";
import { normalizePathname } from "@/lib/routing";

const NAV_ICONS: Record<(typeof ADMIN_NAV_LINKS)[number]["href"], LucideIcon> =
  {
    "/admin/personas": Building2,
    "/admin/mapa": Map,
    "/admin": CalendarDays,
  };

function OrganizationNavItem({
  link,
  active,
  compact,
  orgNav,
}: {
  link: (typeof ADMIN_NAV_LINKS)[number];
  active: boolean;
  compact: boolean;
  orgNav: {
    value: PersonasStructureView;
    onChange: (view: PersonasStructureView) => void;
  };
}) {
  const Icon = NAV_ICONS[link.href];

  return (
    <li className="admin-nav-sidebar__item admin-nav-sidebar__item--org">
      <a
        href={link.href}
        className="admin-nav-sidebar__link"
        aria-current={active ? "page" : undefined}
        title={compact ? link.label : undefined}
      >
        <Icon size={18} className="admin-nav-sidebar__icon" aria-hidden />
        <span className="admin-nav-sidebar__label">{link.label}</span>
      </a>
      <ul
        className="admin-nav-sidebar__submenu"
        aria-label="Vistas de organización"
      >
        {ORGANIZATION_STRUCTURE_VIEWS.map((view) => (
          <li key={view.value}>
            <button
              type="button"
              className="admin-nav-sidebar__submenu-link"
              aria-current={orgNav.value === view.value ? "page" : undefined}
              onClick={() => orgNav.onChange(view.value)}
            >
              <view.Icon
                size={16}
                className="admin-nav-sidebar__icon"
                aria-hidden
              />
              <span className="admin-nav-sidebar__label">{view.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function AdminNav({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const current = normalizePathname(window.location.pathname);
  const isSidebar = orientation === "vertical";
  const compact = useAdminSidebarCompact();
  const orgNav = useAdminOrganizationNav();

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

          if (isSidebar && link.href === "/admin/personas" && orgNav) {
            return (
              <OrganizationNavItem
                key={link.href}
                link={link}
                active={active}
                compact={compact}
                orgNav={orgNav}
              />
            );
          }

          return (
            <li key={link.href}>
              <a
                href={link.href}
                className={
                  isSidebar ? "admin-nav-sidebar__link" : "admin-nav-tabs__tab"
                }
                aria-current={active ? "page" : undefined}
                title={isSidebar ? link.label : undefined}
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
