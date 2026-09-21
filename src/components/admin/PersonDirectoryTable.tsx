import { Button } from "@/components/ui/button";
import { PersonFilterFields } from "@/components/admin/PersonFilterFields";
import { PersonStatusBadge } from "@/components/admin/PersonStatusBadge";
import { nameOf, roleLabel } from "@/components/admin/person-display";
import { adminUiCopy } from "@/content/admin-ui-es";
import {
  directoryRowsForActor,
  parentDisplayName,
  superiorFilterOptions,
} from "@/lib/person-scope";
import type { PersonFilter } from "@/lib/person-filters";
import { filterPersonList, isPersonFilterActive } from "@/lib/person-filters";
import type { Person } from "@/types/domain";

export function PersonDirectoryTable({
  actor,
  people,
  selectedId,
  filter,
  onFilterChange,
  onClearFilter,
  onSelect,
}: {
  actor: Person;
  people: Person[];
  selectedId: string | null;
  filter: PersonFilter;
  onFilterChange: (next: PersonFilter) => void;
  onClearFilter: () => void;
  onSelect: (person: Person) => void;
}) {
  const copy = adminUiCopy.personas.directory;
  const byId = new Map(
    people.map((person) => [person.id.toLowerCase(), person]),
  );
  const rows = filterPersonList(directoryRowsForActor(actor, people), filter);
  const superiorOptions = superiorFilterOptions(actor, people);

  return (
    <div className="person-directory">
      <h2 id="directory-table-title" className="hierarchy-panel-title">
        {copy.title}
      </h2>
      <p className="hierarchy-panel-intro">
        {copy.intro(actor.role === "ADMIN")}
      </p>
      <div className="ui-hierarchy-tree-filter person-directory__filters">
        <PersonFilterFields
          filter={filter}
          superiorOptions={superiorOptions}
          onFilterChange={onFilterChange}
          onClearFilter={onClearFilter}
        />
      </div>
      <div className="person-directory__table-wrap">
        <table
          className="person-directory__table"
          aria-labelledby="directory-table-title"
        >
          <thead>
            <tr>
              <th scope="col">{copy.columns.name}</th>
              <th scope="col">{copy.columns.role}</th>
              <th scope="col">{copy.columns.status}</th>
              <th scope="col">{copy.columns.superior}</th>
              <th scope="col">
                <span className="sr-only">{copy.columns.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="person-directory__empty">
                  {isPersonFilterActive(filter)
                    ? adminUiCopy.personas.filters.emptyMatch
                    : copy.emptyScope}
                </td>
              </tr>
            ) : (
              rows.map((person) => {
                const selected = person.id === selectedId;
                return (
                  <tr
                    key={person.id}
                    data-selected={selected || undefined}
                    className={
                      selected ? "person-directory__row--selected" : undefined
                    }
                  >
                    <td>{nameOf(person)}</td>
                    <td>{roleLabel(person.role)}</td>
                    <td>
                      <PersonStatusBadge status={person.status} />
                    </td>
                    <td>{parentDisplayName(person, byId)}</td>
                    <td>
                      <Button
                        type="button"
                        variant={selected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onSelect(person)}
                      >
                        {selected ? copy.viewSelected : copy.viewDetail}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="person-directory__count" aria-live="polite">
        {copy.resultCount(rows.length)}
      </p>
    </div>
  );
}
