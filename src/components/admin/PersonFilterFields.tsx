import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import { nameOf, roleLabel } from "@/components/admin/person-display";
import { adminUiCopy } from "@/content/admin-ui-es";
import type {
  PersonFilter,
  PersonRoleFilter,
  PersonStatusFilter,
} from "@/lib/person-filters";
import { isPersonFilterActive } from "@/lib/person-filters";
import { PERSON_ROLES, PERSON_STATUSES, type Person } from "@/types/domain";

export function PersonFilterFields({
  filter,
  superiorOptions,
  onFilterChange,
  onClearFilter,
  clearButtonSize = "default",
}: {
  filter: PersonFilter;
  superiorOptions: Person[];
  onFilterChange: (next: PersonFilter) => void;
  onClearFilter: () => void;
  clearButtonSize?: "default" | "sm";
}) {
  const copy = adminUiCopy.personas.filters;
  const filterActive = isPersonFilterActive(filter);

  return (
    <>
      <Field label={copy.searchLabel}>
        <input
          type="search"
          value={filter.text}
          placeholder={copy.searchPlaceholder}
          onChange={(event) =>
            onFilterChange({ ...filter, text: event.target.value })
          }
        />
      </Field>
      <Field label={copy.roleLabel}>
        <select
          value={filter.role}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              role: event.target.value as PersonRoleFilter,
            })
          }
        >
          <option value="TODOS">{copy.allRoles}</option>
          {PERSON_ROLES.filter((role) => role !== "ADMIN").map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={copy.statusLabel}>
        <select
          value={filter.status}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              status: event.target.value as PersonStatusFilter,
            })
          }
        >
          <option value="TODOS">{copy.allStatuses}</option>
          {PERSON_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </Field>
      <Field label={copy.superiorLabel}>
        <select
          value={filter.superiorId}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              superiorId: event.target.value,
            })
          }
        >
          <option value="TODOS">{copy.allSuperiors}</option>
          {superiorOptions.map((person) => (
            <option key={person.id} value={person.id}>
              {nameOf(person)} ({roleLabel(person.role)})
            </option>
          ))}
        </select>
      </Field>
      {filterActive && (
        <Button
          type="button"
          variant="ghost"
          size={clearButtonSize === "sm" ? "sm" : undefined}
          onClick={onClearFilter}
        >
          {copy.clear}
        </Button>
      )}
    </>
  );
}
