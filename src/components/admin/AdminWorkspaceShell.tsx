import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import type { AuthenticatedRole } from "@/types/domain";
import { getInstitutionConfig } from "@/config/institution";
import { InstitutionBrandMark } from "@/components/InstitutionBrandMark";
import { Button } from "@/components/ui/button";

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebarUserCard } from "@/components/admin/AdminSidebarUserCard";

const ADMIN_SIDEBAR_COMPACT_STORAGE_KEY = "aditsystem-admin-sidebar-compact";
const SIDEBAR_NAV_ID = "admin-workspace-sidebar";

function readCompactPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SIDEBAR_COMPACT_STORAGE_KEY) === "1";
}

export function AdminWorkspaceShell({
  header,
  children,
  subNav,
  subheaderTabs,
  userDisplayName,
  userEmail,
  userRole,
  onSignOut,
}: {
  /** Cabecera de página (título, acciones) — vive junto al canvas, no encima del sidebar. */
  header?: ReactNode;
  children: ReactNode;
  subNav?: ReactNode;
  /** Tab bar L2 del canvas (bajo el título de página); única fuente de verdad de vista activa. */
  subheaderTabs?: ReactNode;
  userDisplayName: string;
  userEmail: string;
  userRole: AuthenticatedRole;
  onSignOut: () => void;
}) {
  const institution = getInstitutionConfig();
  const [compact, setCompact] = useState(readCompactPreference);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_COMPACT_STORAGE_KEY,
      compact ? "1" : "0",
    );
  }, [compact]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [mobileNavOpen]);

  const toggleCompact = useCallback(() => {
    setCompact((value) => !value);
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);

  const showBrand = !compact || mobileNavOpen;

  return (
    <div
      className={
        compact
          ? "admin-console-layout admin-console-layout--collapsed"
          : "admin-console-layout"
      }
    >
      <div className="admin-console-topbar">
        <InstitutionBrandMark
          institution={institution}
          className="admin-console-topbar__brand"
          logoClassName="admin-console-topbar__logo"
          monogramClassName="admin-console-topbar__monogram"
          showProductName={false}
          showMonogramFallback
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-console-topbar__toggle"
          onClick={openMobileNav}
          aria-expanded={mobileNavOpen}
          aria-controls={SIDEBAR_NAV_ID}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} aria-hidden="true" />
        </Button>
      </div>
      {mobileNavOpen ? (
        <div
          className="admin-console-backdrop"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      ) : null}
      <aside
        id={SIDEBAR_NAV_ID}
        className={
          mobileNavOpen
            ? "admin-workspace-sidebar admin-workspace-sidebar--mobile-open"
            : "admin-workspace-sidebar"
        }
        aria-label="Navegación de administración"
      >
        <div className="admin-workspace-sidebar__brand">
          {showBrand ? (
            <InstitutionBrandMark
              institution={institution}
              className="admin-workspace-sidebar__brand-mark"
              logoClassName="admin-workspace-sidebar__logo"
              monogramClassName="admin-workspace-sidebar__monogram"
              showProductName={false}
              showMonogramFallback
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-workspace-sidebar__close"
            onClick={closeMobileNav}
            aria-label="Cerrar menú de navegación"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <div
          id="admin-sidebar-nav-block"
          className="admin-workspace-sidebar__nav-block"
        >
          <AdminNav orientation="vertical" />
          {subNav ? (
            <div className="admin-workspace-sidebar__sub">{subNav}</div>
          ) : null}
        </div>
        <AdminSidebarUserCard
          displayName={userDisplayName}
          email={userEmail}
          role={userRole}
          onSignOut={onSignOut}
          compact={compact && !mobileNavOpen}
        />
      </aside>
      <div className="admin-console-layout__body">
        {header}
        {subheaderTabs}
        <div className="admin-workspace-main">{children}</div>
      </div>
    </div>
  );
}
