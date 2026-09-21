import * as React from "react";
import { LogOut } from "lucide-react";

void React;

import type { AuthenticatedRole } from "@/types/domain";
import { adminUserInitials } from "@/lib/admin-user-display";
import { Button } from "@/components/ui/button";
import { RoleChip } from "@/components/ui/RoleChip";

/**
 * Pie del sidebar admin (referencia Personio): identidad + rol + cerrar sesión.
 */
export function AdminSidebarUserCard({
  displayName,
  email,
  role,
  onSignOut,
}: {
  displayName: string;
  email: string;
  role: AuthenticatedRole;
  onSignOut: () => void;
}) {
  const initials = adminUserInitials(displayName);

  return (
    <footer className="admin-sidebar-user">
      <div className="admin-sidebar-user__card">
        <div className="admin-sidebar-user__avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="admin-sidebar-user__meta">
          <p className="admin-sidebar-user__name">{displayName}</p>
          <p className="admin-sidebar-user__role-line">
            <RoleChip role={role} />
          </p>
          <p className="admin-sidebar-user__email">{email}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="admin-sidebar-user__sign-out"
        onClick={onSignOut}
      >
        <LogOut size={16} aria-hidden="true" />
        Cerrar sesión
      </Button>
    </footer>
  );
}
