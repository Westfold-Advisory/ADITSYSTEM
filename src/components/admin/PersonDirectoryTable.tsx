import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import { nameOf, roleLabel } from "@/components/admin/person-display";
import {
  directoryRowsForActor,
  parentDisplayName,
} from "@/lib/person-scope";
import type { PersonFilter, PersonStatusFilter } from "@/lib/person-filters";
import { filterPersonList, isPersonFilterActive } from "@/lib/person-filters";
import { PERSON_STATUSES, type Person } from "@/types/domain";

function PersonStatusBadge({ status }: { status: Person["status"] }) {
  const slug = status.toLowerCase();
  return (
    <span className={`person-status-badge person-status-badge--${slug}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

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
  const byId = new Map(people.map((person) => [person.id.toLowerCase(), person]));
  const rows = filterPersonList(
    directoryRowsForActor(actor, people),
    filter,
  );
  const filterActive = isPersonFilterActive(filter);

  return (
    <div className="person-directory">
      <h2 id="directory-table-title" className="hierarchy-panel-title">
        Listado de personal
      </h2>
      <p className="hierarchy-panel-intro">
        Vista tipo directorio para comparar con el árbol.{" "}
        {actor.role === "ADMIN"
          ? "Como administrador ves todas las personas operativas, sin jerarquía bajo tu cuenta."
          : "Incluye tu alcance y subordinados cargados."}
      </p>
      <div className="ui-hierarchy-tree-filter person-directory__filters">
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
          <Button type="button" variant="ghost" onClick={onClearFilter}>
            Limpiar filtros
          </Button>
        )}
      </div>
      <div className="person-directory__table-wrap">
        <table className="person-directory__table" aria-labelledby="directory-table-title">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Rol</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Estado</th>
              <th scope="col">Superior</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="person-directory__empty">
                  No hay personas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              rows.map((person) => {
                const selected = person.id === selectedId;
                return (
                  <tr
                    key={person.id}
                    data-selected={selected || undefined}
                    className={selected ? "person-directory__row--selected" : undefined}
                  >
                    <td>{nameOf(person)}</td>
                    <td>{roleLabel(person.role)}</td>
                    <td>{person.telefono || "—"}</td>
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
                        {selected ? "Seleccionado" : "Ver ficha"}
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
        {rows.length} persona{rows.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
