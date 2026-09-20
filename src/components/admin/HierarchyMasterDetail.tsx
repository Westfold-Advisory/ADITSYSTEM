import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/AsyncState";

import { TreeSheet } from "./TreeSheet";

export function HierarchyMasterDetail({
  treePanel,
  detailPanel,
  treeSheetOpen,
  onOpenTreeSheet,
  onCloseTreeSheet,
  hasSelection,
}: {
  treePanel: ReactNode;
  detailPanel: ReactNode;
  treeSheetOpen: boolean;
  onOpenTreeSheet: () => void;
  onCloseTreeSheet: () => void;
  hasSelection: boolean;
}) {
  return (
    <div className="hierarchy-master-detail">
      <Button
        type="button"
        className="hierarchy-tree-toggle"
        variant="outline"
        onClick={onOpenTreeSheet}
      >
        Ver estructura
      </Button>

      <aside
        className="hierarchy-tree-panel hierarchy-tree-panel--fixed"
        aria-labelledby="structure-title"
      >
        {treePanel}
      </aside>

      <section
        className="hierarchy-detail-section"
        aria-live="polite"
        aria-label="Detalle de la persona seleccionada"
      >
        {hasSelection ? (
          detailPanel
        ) : (
          <EmptyState>Selecciona una persona de la estructura.</EmptyState>
        )}
      </section>

      <TreeSheet
        open={treeSheetOpen}
        title="Tu estructura"
        onClose={onCloseTreeSheet}
      >
        {treePanel}
      </TreeSheet>
    </div>
  );
}
