import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import {
  emptyPersonFilter,
  type PersonFilter,
  type PersonStatusFilter,
} from "@/lib/person-filters";
import { PERSON_STATUSES, type Person } from "@/types/domain";

import { nameOf, roleLabel } from "./person-display";

function TreeNode({
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
}: {
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
}) {
  const hasChildren = person.role !== "AMIGO";
  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selectedId === person.id}
    >
      <div className="tree-node">
        {hasChildren ? (
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`${expanded ? "Contraer" : "Expandir"} ${nameOf(person)}`}
            aria-expanded={expanded}
            status={loading ? "loading" : "idle"}
            onClick={() => onToggle(person)}
          >
            {expanded ? "−" : "+"}
          </Button>
        ) : (
          <span className="tree-spacer" aria-hidden="true" />
        )}
        <button
          type="button"
          className="tree-person"
          onClick={() => onSelect(person)}
        >
          {nameOf(person)} <small>{roleLabel(person.role)}</small>
        </button>
      </div>
      {expanded && (
        <ul role="group">
          {children?.map((child) => (
            <TreeNode
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
            <li className="tree-empty">
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

export function HierarchyTreePanel({
  self,
  selectedId,
  filter,
  filterActive,
  filteredChildren,
  children,
  expanded,
  loadingNode,
  onFilterChange,
  onClearFilter,
  onSelect,
  onToggle,
}: {
  self: Person;
  selectedId: string | null;
  filter: PersonFilter;
  filterActive: boolean;
  filteredChildren: Record<string, Person[]>;
  children: Record<string, Person[]>;
  expanded: Record<string, boolean>;
  loadingNode: string | null;
  onFilterChange: (next: PersonFilter) => void;
  onClearFilter: () => void;
  onSelect: (person: Person) => void;
  onToggle: (person: Person) => void;
}) {
  return (
    <>
      <h2 id="structure-title">Tu estructura</h2>
      <div className="tree-filter-bar">
        <Field label="Buscar por nombre">
          <input
            type="search"
            value={filter.text}
            placeholder="Nombre o apellido"
            onChange={(event) =>
              onFilterChange({ ...filter, text: event.target.value })
            }
          />
        </Field>
        <Field label="Estado">
          <select
            value={filter.status}
            onChange={(event) =>
              onFilterChange({
                ...filter,
                status: event.target.value as PersonStatusFilter,
              })
            }
          >
            <option value="TODOS">Todos</option>
            {PERSON_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
        {filterActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
          >
            Limpiar filtro
          </Button>
        )}
      </div>
      <ul role="tree" aria-busy={loadingNode === self.id}>
        <TreeNode
          person={self}
          selectedId={selectedId}
          expanded={Boolean(expanded[self.id])}
          children={filteredChildren[self.id]}
          totalChildren={children[self.id]?.length}
          filterActive={filterActive}
          loading={loadingNode === self.id}
          expandedById={expanded}
          childrenById={filteredChildren}
          totalChildrenById={children}
          loadingNode={loadingNode}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      </ul>
    </>
  );
}

export { emptyPersonFilter };
