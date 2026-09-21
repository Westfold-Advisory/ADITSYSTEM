import {
  HierarchyTreeFilterBar,
  HierarchyTreeRoot,
} from "@/components/ui/HierarchyTree";
import { PersonFilterFields } from "@/components/admin/PersonFilterFields";
import { superiorFilterOptions } from "@/lib/person-scope";
import type { PersonFilter } from "@/lib/person-filters";
import { adminUiCopy } from "@/content/admin-ui-es";
import type { Person } from "@/types/domain";

export function HierarchyTreePanel({
  self,
  selectedId,
  filter,
  filterActive,
  filteredChildren,
  children,
  expanded,
  loadingNode,
  peopleInScope,
  onFilterChange,
  onClearFilter,
  onSelect,
  onToggle,
  hideRoot = false,
}: {
  self: Person;
  selectedId: string | null;
  filter: PersonFilter;
  filterActive: boolean;
  filteredChildren: Record<string, Person[]>;
  children: Record<string, Person[]>;
  expanded: Record<string, boolean>;
  loadingNode: string | null;
  peopleInScope: Person[];
  onFilterChange: (next: PersonFilter) => void;
  onClearFilter: () => void;
  onSelect: (person: Person) => void;
  onToggle: (person: Person) => void;
  hideRoot?: boolean;
}) {
  const copy = adminUiCopy.personas.tree;
  const superiorOptions = superiorFilterOptions(self, peopleInScope);

  return (
    <>
      <h2 id="structure-title" className="hierarchy-panel-title">
        {copy.title}
      </h2>
      <p className="hierarchy-panel-intro">
        {hideRoot ? copy.introAdmin : copy.introDefault}
      </p>
      <HierarchyTreeRoot
        omitRoot={hideRoot}
        busy={loadingNode === self.id}
        filterBar={
          <HierarchyTreeFilterBar>
            <PersonFilterFields
              filter={filter}
              superiorOptions={superiorOptions}
              onFilterChange={onFilterChange}
              onClearFilter={onClearFilter}
              clearButtonSize="sm"
            />
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
