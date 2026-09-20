import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

/** Panel lateral móvil para el árbol jerárquico (patrón sheet M3). */
export function TreeSheet({
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
      className="ui-sheet"
      aria-labelledby="hierarchy-sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="ui-sheet-panel">
        <header>
          <h2 id="hierarchy-sheet-title">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            aria-label="Cerrar panel de estructura"
            onClick={onClose}
          >
            ×
          </Button>
        </header>
        <div className="ui-sheet-body">{children}</div>
      </div>
    </dialog>
  );
}
