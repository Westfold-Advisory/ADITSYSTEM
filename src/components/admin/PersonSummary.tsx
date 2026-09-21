import type { Person, PersonMetrics } from "@/types/domain";

import { RoleChip } from "@/components/ui/RoleChip";

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
      <dl className="person-summary__facts">
        <div className="person-summary__fact">
          <dt>Teléfono</dt>
          <dd>{person.telefono?.trim() ? person.telefono : "—"}</dd>
        </div>
        <div className="person-summary__fact">
          <dt>Registro</dt>
          <dd>{person.registeredAt.toLocaleDateString("es-MX")}</dd>
        </div>
        <div className="person-summary__fact">
          <dt>Descendientes</dt>
          <dd>{metrics?.descendants ?? "—"}</dd>
        </div>
        <div className="person-summary__fact">
          <dt>Documentos</dt>
          <dd>{metrics?.documents ?? "—"}</dd>
        </div>
      </dl>
    </header>
  );
}
