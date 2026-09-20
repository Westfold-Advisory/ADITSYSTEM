import * as React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  buildVisibleTreeRows,
  countScopeNodes,
  sliceVirtualWindow,
  treeKeyboardAction,
  TREE_ROW_HEIGHT_PX,
  VIRTUALIZATION_SCOPE_THRESHOLD,
  type TreeNavigationKey,
  type TreeRow,
} from "@/lib/hierarchy-tree";
import { cn } from "@/lib/utils";
import { roleLabel } from "@/lib/role-label";
import type { Person } from "@/types/domain";

void React;

function personName(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function treeItemLabel(person: Person): string {
  return `${personName(person)}, ${roleLabel(person.role)}`;
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
  treeRef,
  onKeyDown,
  style,
  ...props
}: ComponentProps<"ul"> & {
  busy?: boolean;
  treeRef?: React.RefObject<HTMLUListElement | null>;
}) {
  return (
    <ul
      ref={treeRef}
      role="tree"
      className={cn("ui-hierarchy-tree", className)}
      aria-busy={busy || undefined}
      style={style}
      onKeyDown={onKeyDown}
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

function FlatHierarchyTreeRow({
  row,
  selectedId,
  focusedId,
  filterActive,
  visibleChildCount,
  totalChildCount,
  loading,
  onSelect,
  onToggle,
  onFocusRow,
}: {
  row: TreeRow;
  selectedId: string | null;
  focusedId: string;
  filterActive: boolean;
  visibleChildCount: number;
  totalChildCount: number;
  loading: boolean;
  onSelect: (person: Person) => void;
  onToggle: (person: Person) => void;
  onFocusRow: (person: Person) => void;
}) {
  const { person, depth, hasChildren, expanded } = row;

  return (
    <li
      role="treeitem"
      data-tree-id={person.id}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selectedId === person.id}
      aria-level={depth + 1}
      style={{ paddingLeft: `${depth * 1}rem` }}
    >
      <div className="ui-hierarchy-tree-node">
        {hasChildren ? (
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`${expanded ? "Contraer" : "Expandir"} ${personName(person)}`}
            aria-expanded={expanded}
            status={loading ? "loading" : "idle"}
            tabIndex={-1}
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
          tabIndex={focusedId === person.id ? 0 : -1}
          onClick={() => onSelect(person)}
          onFocus={() => onFocusRow(person)}
        >
          {personName(person)} <small>{roleLabel(person.role)}</small>
        </button>
      </div>
      {expanded && !loading && visibleChildCount === 0 && hasChildren && (
        <p
          className="ui-hierarchy-tree-empty"
          style={{ paddingLeft: "1.75rem" }}
        >
          {filterActive && totalChildCount > 0
            ? "Ningún descendiente coincide con el filtro."
            : "Sin descendientes."}
        </p>
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
  const {
    person: self,
    selectedId,
    expandedById,
    childrenById,
    totalChildrenById,
    filterActive,
    loadingNode,
    onSelect,
    onToggle,
  } = root;

  const treeRef = useRef<HTMLUListElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rovingFocusId, setRovingFocusId] = useState<string | null>(null);
  const focusedId = rovingFocusId ?? selectedId ?? self.id;
  const [announcement, setAnnouncement] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);

  const scopeSize = useMemo(
    () => countScopeNodes(self, totalChildrenById),
    [self, totalChildrenById],
  );
  const virtualized = scopeSize >= VIRTUALIZATION_SCOPE_THRESHOLD;

  const rows = useMemo(
    () => buildVisibleTreeRows(self, childrenById, expandedById),
    [self, childrenById, expandedById],
  );

  const virtualWindow = useMemo(() => {
    if (!virtualized) {
      return {
        start: 0,
        end: rows.length,
        offsetY: 0,
        totalHeight: rows.length * TREE_ROW_HEIGHT_PX,
      };
    }
    return sliceVirtualWindow(rows.length, scrollTop, viewportHeight);
  }, [virtualized, rows.length, scrollTop, viewportHeight]);

  const visibleRows = useMemo(
    () => rows.slice(virtualWindow.start, virtualWindow.end),
    [rows, virtualWindow.end, virtualWindow.start],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !virtualized) return;
    const measure = () => setViewportHeight(node.clientHeight || 320);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [virtualized]);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const scrollRowIntoView = useCallback(
    (index: number) => {
      if (!virtualized || !scrollRef.current) return;
      const rowTop = index * TREE_ROW_HEIGHT_PX;
      const rowBottom = rowTop + TREE_ROW_HEIGHT_PX;
      const { scrollTop: current, clientHeight } = scrollRef.current;
      if (rowTop < current) {
        scrollRef.current.scrollTop = rowTop;
      } else if (rowBottom > current + clientHeight) {
        scrollRef.current.scrollTop = rowBottom - clientHeight;
      }
    },
    [virtualized],
  );

  const handleToggle = useCallback(
    (person: Person) => {
      const willExpand = !expandedById[person.id];
      onToggle(person);
      announce(
        willExpand
          ? `${personName(person)} expandido`
          : `${personName(person)} contraído`,
      );
    },
    [announce, expandedById, onToggle],
  );

  const handleTreeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      const key = event.key;
      if (
        key !== "ArrowDown" &&
        key !== "ArrowUp" &&
        key !== "ArrowLeft" &&
        key !== "ArrowRight" &&
        key !== "Home" &&
        key !== "End"
      ) {
        return;
      }
      event.preventDefault();
      const focusedIndex = rows.findIndex((row) => row.person.id === focusedId);
      if (focusedIndex < 0) return;

      const action = treeKeyboardAction(
        key as TreeNavigationKey,
        rows,
        focusedIndex,
      );

      if (action.toggleExpand === "expand") {
        const person = rows[focusedIndex].person;
        if (!expandedById[person.id]) {
          onToggle(person);
          announce(`${personName(person)} expandido`);
        }
        return;
      }
      if (action.toggleExpand === "collapse") {
        const person = rows[focusedIndex].person;
        if (expandedById[person.id]) {
          onToggle(person);
          announce(`${personName(person)} contraído`);
        }
        return;
      }

      if (action.nextIndex === focusedIndex) return;

      const next = rows[action.nextIndex];
      if (!next) return;
      setRovingFocusId(next.person.id);
      onSelect(next.person);
      announce(treeItemLabel(next.person));
      scrollRowIntoView(action.nextIndex);

      requestAnimationFrame(() => {
        const item = treeRef.current?.querySelector<HTMLElement>(
          `[data-tree-id="${CSS.escape(next.person.id)}"] .ui-hierarchy-tree-person`,
        );
        item?.focus();
      });
    },
    [
      announce,
      expandedById,
      focusedId,
      onSelect,
      onToggle,
      rows,
      scrollRowIntoView,
    ],
  );

  const treeList = (
    <HierarchyTree
      treeRef={treeRef}
      busy={busy}
      className={virtualized ? "ui-hierarchy-tree-virtual-window" : undefined}
      style={
        virtualized
          ? { transform: `translateY(${virtualWindow.offsetY}px)` }
          : undefined
      }
      onKeyDown={handleTreeKeyDown}
    >
      {visibleRows.map((row) => (
        <FlatHierarchyTreeRow
          key={row.person.id}
          row={row}
          selectedId={selectedId}
          focusedId={focusedId}
          filterActive={filterActive}
          visibleChildCount={childrenById[row.person.id]?.length ?? 0}
          totalChildCount={totalChildrenById[row.person.id]?.length ?? 0}
          loading={loadingNode === row.person.id}
          onSelect={onSelect}
          onToggle={handleToggle}
          onFocusRow={(person) => setRovingFocusId(person.id)}
        />
      ))}
    </HierarchyTree>
  );

  return (
    <>
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-testid="tree-live-region"
      >
        {announcement}
      </div>
      {filterBar}
      {virtualized ? (
        <div
          ref={scrollRef}
          className="ui-hierarchy-tree-virtual-scroll"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div
            className="ui-hierarchy-tree-virtual-track"
            style={{ height: virtualWindow.totalHeight }}
          >
            {treeList}
          </div>
        </div>
      ) : (
        treeList
      )}
    </>
  );
}
