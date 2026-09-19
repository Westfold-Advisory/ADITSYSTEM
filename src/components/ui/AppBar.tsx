import * as React from "react";
import type { ReactNode } from "react";

void React;

import { cn } from "@/lib/utils";

export function AppBar({
  brand,
  actions,
  className,
}: {
  brand: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("ui-app-bar", className)}>
      <div className="ui-app-bar-brand">{brand}</div>
      {actions && <div className="ui-app-bar-actions">{actions}</div>}
    </header>
  );
}

export function Navigation({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={cn("ui-navigation", className)}
      aria-label="Navegación principal"
    >
      {children}
    </nav>
  );
}
