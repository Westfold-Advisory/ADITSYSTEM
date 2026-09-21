import { useMemo } from "react";

import { DescriptionList } from "@/components/ui/DescriptionList";
import { RoleChip } from "@/components/ui/RoleChip";
import type { Person, PersonMetrics } from "@/types/domain";

import { nameOf } from "./person-display";
import { PersonStatusBadge } from "./PersonStatusBadge";

function personInitials(person: Person): string {
  const parts = [
    person.nombre,
    person.apellidoPaterno,
    person.apellidoMaterno,
  ].filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
}

/**
 * Cabecera de persona para drawer (patrón PersonSummary).
 * Sin Card anidada; pensado para `person-drawer`.
 */
export function PersonSummary({
  person,
  metrics,
}: {
  person: Person;
  metrics: PersonMetrics | null;
}) {
  const factItems = useMemo(
    () => [
      {
        term: "Teléfono",
        value: person.telefono?.trim() ? person.telefono : "—",
      },
      {
        term: "Registro",
        value: person.registeredAt.toLocaleDateString("es-MX"),
      },
      {
        term: "Descendientes",
        value: metrics?.descendants ?? "—",
      },
      {
        term: "Documentos",
        value: metrics?.documents ?? "—",
      },
    ],
    [
      person.registeredAt,
      person.telefono,
      metrics?.descendants,
      metrics?.documents,
    ],
  );

  return (
    <header className="person-summary">
      <div className="person-summary__hero">
        <div className="person-summary__avatar" aria-hidden="true">
          {personInitials(person)}
        </div>
        <div className="person-summary__identity">
          <h2 className="person-summary__name">{nameOf(person)}</h2>
          <p className="person-summary__role-line">
            <RoleChip role={person.role} />
          </p>
          <PersonStatusBadge status={person.status} />
        </div>
      </div>
      <DescriptionList items={factItems} className="person-summary__facts" />
    </header>
  );
}
