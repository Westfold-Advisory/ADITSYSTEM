import * as React from "react";
import { useEffect, useRef, type ReactNode } from "react";

void React;

import { Button } from "./button";

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      aria-labelledby="ui-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="ui-dialog-title">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          aria-label="Cerrar diálogo"
          onClick={onClose}
        >
          ×
        </Button>
      </header>
      {children}
    </dialog>
  );
}
