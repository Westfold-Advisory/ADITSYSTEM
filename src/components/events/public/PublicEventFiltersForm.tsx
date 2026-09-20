import * as React from "react";

void React;

import { Field } from "@/components/ui/Field";
import type {
  PublicEventDateFilter,
  PublicEventFilters,
} from "@/lib/public-event-filters";

export type PublicEventFiltersFormProps = {
  filters: PublicEventFilters;
  eventTypes: string[];
  onChange: (next: PublicEventFilters) => void;
  idPrefix?: string;
};

export function PublicEventFiltersForm({
  filters,
  eventTypes,
  onChange,
  idPrefix = "public-event-filters",
}: PublicEventFiltersFormProps) {
  return (
    <div className="public-event-filters">
      <Field label="Buscar eventos">
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="Nombre, lugar o descripción"
          autoComplete="off"
        />
      </Field>
      <div className="public-event-filters__row">
        <Field label="Tipo">
          <select
            id={`${idPrefix}-type`}
            className="ui-control"
            value={filters.type}
            onChange={(event) =>
              onChange({ ...filters, type: event.target.value })
            }
          >
            <option value="all">Todos</option>
            {eventTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha">
          <select
            id={`${idPrefix}-date`}
            className="ui-control"
            value={filters.date}
            onChange={(event) =>
              onChange({
                ...filters,
                date: event.target.value as PublicEventDateFilter,
              })
            }
          >
            <option value="all">Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Próximos 7 días</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
