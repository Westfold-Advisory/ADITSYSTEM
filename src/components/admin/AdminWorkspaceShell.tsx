import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import type { AuthenticatedRole } from "@/types/domain";
import { getInstitutionConfig } from "@/config/institution";
import { InstitutionBrandMark } from "@/components/InstitutionBrandMark";
import { Button } from "@/components/ui/button";

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebarUserCard } from "@/components/admin/AdminSidebarUserCard";
import {
  AdminOrganizationNavContext,
  type AdminOrganizationNavValue,
} from "@/components/admin/admin-organization-nav-context";
import {
  ADMIN_SIDEBAR_COMPACT_STORAGE_KEY,
  AdminSidebarContext,
} from "@/components/admin/admin-sidebar-context";

function readCompactPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SIDEBAR_COMPACT_STORAGE_KEY) === "1";
}

export function AdminWorkspaceShell({
  header,
  children,
  subNav,
  organizationViews,
  userDisplayName,
  userEmail,
  userRole,
  onSignOut,
}: {
  /** Cabecera de página (título, acciones) — vive junto al canvas, no encima del sidebar. */
  header?: ReactNode;
  children: ReactNode;
  subNav?: ReactNode;
  /** Vistas L2 de Organización (hover en sidebar); solo en /admin/personas. */
  organizationViews?: AdminOrganizationNavValue;
  userDisplayName: string;
  userEmail: string;
  userRole: AuthenticatedRole;
  onSignOut: () => void;
}) {
  const institution = getInstitutionConfig();
  const [compact, setCompact] = useState(readCompactPreference);

  useEffect(() => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_COMPACT_STORAGE_KEY,
      compact ? "1" : "0",
    );
  }, [compact]);

  const toggleCompact = useCallback(() => {
    setCompact((value) => !value);
  }, []);

  return (
    <AdminSidebarContext.Provider value={{ compact }}>
      <div
        className={
          compact
            ? "admin-console-layout admin-console-layout--collapsed"
            : "admin-console-layout"
        }
      >
        <aside
          className="admin-workspace-sidebar"
          aria-label="Navegación de administración"
        >
          <div className="admin-workspace-sidebar__brand">
            {!compact ? (
              <InstitutionBrandMark
                institution={institution}
                className="admin-workspace-sidebar__brand-mark"
                logoClassName="admin-workspace-sidebar__logo"
                productClassName="admin-workspace-sidebar__product"
                showProductName
              />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="admin-workspace-sidebar__collapse"
              onClick={toggleCompact}
              aria-expanded={!compact}
              aria-controls="admin-sidebar-nav-block"
              aria-label={
                compact ? "Expandir menú lateral" : "Contraer menú lateral"
              }
            >
              {compact ? (
                <PanelLeftOpen size={18} aria-hidden="true" />
              ) : (
                <PanelLeftClose size={18} aria-hidden="true" />
              )}
            </Button>
          </div>
          <div
            id="admin-sidebar-nav-block"
            className="admin-workspace-sidebar__nav-block"
          >
            <AdminOrganizationNavContext.Provider
              value={organizationViews ?? null}
            >
              <AdminNav orientation="vertical" />
            </AdminOrganizationNavContext.Provider>
            {subNav ? (
              <div className="admin-workspace-sidebar__sub">{subNav}</div>
            ) : null}
          </div>
          <AdminSidebarUserCard
            displayName={userDisplayName}
            email={userEmail}
            role={userRole}
            onSignOut={onSignOut}
            compact={compact}
          />
        </aside>
        <div className="admin-console-layout__body">
          {header}
          <div className="admin-workspace-main">{children}</div>
        </div>
      </div>
    </AdminSidebarContext.Provider>
  );
}
