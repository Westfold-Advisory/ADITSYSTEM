import { useEffect, useId, useRef, type ReactNode } from "react";

import { useModalFocus } from "@/hooks/useModalFocus";

import { Button } from "./button";

/**
 * Confirmación institucional accesible (admin): foco inicial en cancelar,
 * trap de tabulación, cierre con Esc.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirmVariant = "destructive",
  onConfirm,
  onCancel,
  busy = false,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "destructive" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useModalFocus({
    containerRef: panelRef,
    onClose: onCancel,
    initialFocusRef: cancelButtonRef,
    enabled: open,
  });

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog ui-dialog--confirm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div ref={panelRef} className="ui-dialog__panel">
        <header>
          <h2 id={titleId}>{title}</h2>
        </header>
        <div id={descriptionId} className="ui-dialog__body">
          {description}
        </div>
        <footer className="ui-dialog__actions">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={busy}
            status={busy ? "loading" : undefined}
            aria-busy={busy || undefined}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
