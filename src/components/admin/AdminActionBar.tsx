import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Agrupa acciones DS en consola admin (Etapa 1).
 * Usar variantes Button según docs/design-system/admin-actions.md
 */
export function AdminActionBar({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  /** Etiqueta cuando la barra no tiene texto visible propio. */
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn("admin-action-bar", className)}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
