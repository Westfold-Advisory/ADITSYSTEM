import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import {
  HierarchyTreeFilterBar,
  HierarchyTreeRoot,
} from "@/components/ui/HierarchyTree";
import type { PersonFilter, PersonStatusFilter } from "@/lib/person-filters";
import { PERSON_STATUSES, type Person } from "@/types/domain";

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
      <h2 id="structure-title" className="hierarchy-panel-title">
        Directorio
      </h2>
      <p className="hierarchy-panel-intro">
        Explora tu alcance jerárquico. Selecciona una persona para ver detalle y
        acciones permitidas.
      </p>
      <HierarchyTreeRoot
        busy={loadingNode === self.id}
        filterBar={
          <HierarchyTreeFilterBar>
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
          </HierarchyTreeFilterBar>
        }
        root={{
          person: self,
          selectedId,
          expanded: Boolean(expanded[self.id]),
          children: filteredChildren[self.id],
          totalChildren: children[self.id]?.length,
          filterActive,
          loading: loadingNode === self.id,
          expandedById: expanded,
          childrenById: filteredChildren,
          totalChildrenById: children,
          loadingNode,
          onSelect,
          onToggle,
        }}
      />
    </>
  );
}
