import * as React from "react";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

void React;

import { useModalFocus } from "@/hooks/useModalFocus";
import { cn } from "@/lib/utils";

/**
 * Panel lateral admin reutilizable (Personas, mapa cobertura).
 * Focus trap, Escape y restauración de foco vía `useModalFocus`.
 */
export function Drawer({
  open,
  onDismiss,
  ariaLabel,
  returnFocusRef,
  className,
  children,
}: {
  open: boolean;
  onDismiss: () => void;
  ariaLabel: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLElement>(null);

  useModalFocus({
    containerRef,
    returnFocusRef,
    onClose: onDismiss,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const initial = containerRef.current?.querySelector<HTMLElement>(
      "[data-ui-drawer-initial-focus]",
    );
    initial?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <section
      ref={containerRef}
      className={cn("ui-drawer", "hierarchy-detail-drawer", className)}
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="ui-drawer__main">{children}</div>
    </section>
  );
}
