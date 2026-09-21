import * as React from "react";
import { LogOut } from "lucide-react";

void React;

import type { AuthenticatedRole } from "@/types/domain";
import { adminUserInitials } from "@/lib/admin-user-display";
import { Button } from "@/components/ui/button";
import { RoleChip } from "@/components/ui/RoleChip";

/**
 * Pie del sidebar admin: identidad compacta + cerrar sesión.
 */
export function AdminSidebarUserCard({
  displayName,
  email,
  role,
  onSignOut,
  compact = false,
}: {
  displayName: string;
  email: string;
  role: AuthenticatedRole;
  onSignOut: () => void;
  compact?: boolean;
}) {
  const initials = adminUserInitials(displayName);
  const profileTitle = `${displayName} · ${email}`;

  if (compact) {
    return (
      <footer className="admin-sidebar-user admin-sidebar-user--compact">
        <div
          className="admin-sidebar-user__avatar"
          title={profileTitle}
          aria-hidden="true"
        >
          {initials}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-sidebar-user__sign-out-icon"
          onClick={onSignOut}
          aria-label={`Cerrar sesión (${displayName})`}
        >
          <LogOut size={18} aria-hidden="true" />
        </Button>
      </footer>
    );
  }

  return (
    <footer className="admin-sidebar-user">
      <div className="admin-sidebar-user__profile" title={email}>
        <div className="admin-sidebar-user__avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="admin-sidebar-user__meta">
          <p className="admin-sidebar-user__name">{displayName}</p>
          <div className="admin-sidebar-user__role-line">
            <RoleChip role={role} />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="admin-sidebar-user__sign-out"
        onClick={onSignOut}
      >
        <LogOut size={16} aria-hidden="true" />
        Cerrar sesión
      </button>
    </footer>
  );
}
