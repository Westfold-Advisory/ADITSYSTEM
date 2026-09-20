import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  onSignOut,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  onSignOut: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <AdminNav />
        {actions}
        <button type="button" onClick={onSignOut}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
