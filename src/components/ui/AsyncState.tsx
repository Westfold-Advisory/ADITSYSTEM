import * as React from "react";
import type { ReactNode } from "react";

void React;

import { Alert } from "./Alert";
import { Button } from "./button";
import { ResultsPanelSkeleton } from "./Skeleton";

export function LoadingState({
  label = "Cargando…",
  children = <ResultsPanelSkeleton />,
}: {
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="ui-state ui-state--loading"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function EmptyState({
  children,
  actionLabel,
  onAction,
}: {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="ui-state">
      <p>{children}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert tone="error" title="No se pudo completar la solicitud">
      {message}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} status="error">
          Reintentar
        </Button>
      )}
    </Alert>
  );
}
