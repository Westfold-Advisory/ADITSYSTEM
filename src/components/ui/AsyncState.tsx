import * as React from "react";
import type { ReactNode } from "react";

void React;

import { Alert } from "./Alert";
import { Button } from "./button";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="ui-state" role="status">
      <span className="ui-spinner" aria-hidden="true" />
      {label}
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
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </Alert>
  );
}
