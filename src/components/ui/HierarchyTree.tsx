import * as React from "react";
import type { ComponentProps, ReactNode } from "react";

void React;

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Person } from "@/types/domain";

import { roleLabel } from "@/lib/role-label";

function personName(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

export function HierarchyLayout({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("ui-hierarchy-layout", className)} {...props}>
      {children}
    </div>
  );
}

export function HierarchyTreePanel({
  title,
  titleId,
  children,
  className,
  ...props
}: ComponentProps<"section"> & {
  title: string;
  titleId: string;
}) {
  return (
    <section
      className={cn("ui-hierarchy-tree-panel", className)}
      aria-labelledby={titleId}
      {...props}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
    </section>
  );
}

export function HierarchyTree({
  children,
  busy,
  className,
  ...props
}: ComponentProps<"ul"> & { busy?: boolean }) {
  return (
    <ul
      role="tree"
      className={cn("ui-hierarchy-tree", className)}
      aria-busy={busy || undefined}
      {...props}
    >
      {children}
    </ul>
  );
}

export type HierarchyTreeNodeProps = {
  person: Person;
  selectedId: string | null;
  expanded: boolean;
  children: Person[] | undefined;
  totalChildren: number | undefined;
  filterActive: boolean;
  loading: boolean;
  expandedById: Record<string, boolean>;
  childrenById: Record<string, Person[]>;
  totalChildrenById: Record<string, Person[]>;
  loadingNode: string | null;
  onSelect: (person: Person) => void;
  onToggle: (person: Person) => void;
};

export function HierarchyTreeNode({
  person,
  selectedId,
  expanded,
  children,
  totalChildren,
  filterActive,
  loading,
  expandedById,
  childrenById,
  totalChildrenById,
  loadingNode,
  onSelect,
  onToggle,
}: HierarchyTreeNodeProps) {
  const hasChildren = person.role !== "AMIGO";
  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selectedId === person.id}
    >
      <div className="ui-hierarchy-tree-node">
        {hasChildren ? (
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`${expanded ? "Contraer" : "Expandir"} ${personName(person)}`}
            aria-expanded={expanded}
            status={loading ? "loading" : "idle"}
            onClick={() => onToggle(person)}
          >
            {expanded ? "−" : "+"}
          </Button>
        ) : (
          <span className="ui-hierarchy-tree-spacer" aria-hidden="true" />
        )}
        <button
          type="button"
          className="ui-hierarchy-tree-person"
          onClick={() => onSelect(person)}
        >
          {personName(person)} <small>{roleLabel(person.role)}</small>
        </button>
      </div>
      {expanded && (
        <ul role="group">
          {children?.map((child) => (
            <HierarchyTreeNode
              key={child.id}
              person={child}
              selectedId={selectedId}
              expanded={Boolean(expandedById[child.id])}
              children={childrenById[child.id]}
              totalChildren={totalChildrenById[child.id]?.length}
              filterActive={filterActive}
              loading={loadingNode === child.id}
              expandedById={expandedById}
              childrenById={childrenById}
              totalChildrenById={totalChildrenById}
              loadingNode={loadingNode}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
          {!loading && children?.length === 0 && (
            <li className="ui-hierarchy-tree-empty">
              {filterActive && (totalChildren ?? 0) > 0
                ? "Ningún descendiente coincide con el filtro."
                : "Sin descendientes."}
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

export function HierarchyTreeFilterBar({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("ui-hierarchy-tree-filter", className)} {...props}>
      {children}
    </div>
  );
}

export type HierarchyTreeRootProps = {
  filterBar?: ReactNode;
  busy?: boolean;
  root: HierarchyTreeNodeProps;
};

export function HierarchyTreeRoot({
  filterBar,
  busy,
  root,
}: HierarchyTreeRootProps) {
  return (
    <>
      {filterBar}
      <HierarchyTree busy={busy}>
        <HierarchyTreeNode {...root} />
      </HierarchyTree>
    </>
  );
}
