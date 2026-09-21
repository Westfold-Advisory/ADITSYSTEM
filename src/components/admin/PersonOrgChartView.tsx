import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { nameOf, roleLabel } from "@/components/admin/person-display";
import { orgChartRoots } from "@/lib/person-scope";
import type { Person } from "@/types/domain";

function OrgChartNode({
  person,
  childrenById,
  selectedId,
  onSelect,
}: {
  person: Person;
  childrenById: Record<string, Person[]>;
  selectedId: string | null;
  onSelect: (person: Person) => void;
}) {
  const children = childrenById[person.id] ?? [];
  const selected = person.id === selectedId;

  return (
    <li className="org-chart__node">
      <button
        type="button"
        className="org-chart__card"
        data-selected={selected || undefined}
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(person)}
      >
        <span className="org-chart__avatar" aria-hidden="true">
          {person.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="org-chart__name">{nameOf(person)}</span>
        <span className="org-chart__role">{roleLabel(person.role)}</span>
      </button>
      {children.length > 0 && (
        <ul className="org-chart__children">
          {children.map((child) => (
            <OrgChartNode
              key={child.id}
              person={child}
              childrenById={childrenById}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function PersonOrgChartView({
  root,
  childrenById,
  selectedId,
  onSelect,
}: {
  root: Person;
  childrenById: Record<string, Person[]>;
  selectedId: string | null;
  onSelect: (person: Person) => void;
}) {
  const roots = useMemo(
    () => orgChartRoots(root, childrenById),
    [root, childrenById],
  );
  const [scale, setScale] = useState(1);

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(1.5, Math.round((current + 0.1) * 10) / 10));
  }, []);
  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(0.6, Math.round((current - 0.1) * 10) / 10));
  }, []);
  const resetZoom = useCallback(() => setScale(1), []);

  return (
    <div className="person-org-chart">
      <div className="person-org-chart__header">
        <div>
          <h2 id="org-chart-title" className="hierarchy-panel-title">
            Organigrama
          </h2>
          <p className="hierarchy-panel-intro">
            Vista gráfica para validar jerarquía con el equipo. Haz clic en una
            tarjeta para abrir la ficha.
          </p>
        </div>
        <div
          className="person-org-chart__zoom"
          aria-label="Zoom del organigrama"
        >
          <Button type="button" variant="outline" size="sm" onClick={zoomOut}>
            −
          </Button>
          <span className="person-org-chart__zoom-label">
            {Math.round(scale * 100)}%
          </span>
          <Button type="button" variant="outline" size="sm" onClick={zoomIn}>
            +
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetZoom}>
            Ajustar
          </Button>
        </div>
      </div>
      <div className="person-org-chart__viewport">
        <ul
          className="org-chart"
          style={{ transform: `scale(${scale})` }}
          aria-labelledby="org-chart-title"
        >
          {roots.length === 0 ? (
            <li className="org-chart__empty">No hay nodos para mostrar.</li>
          ) : (
            roots.map((person) => (
              <OrgChartNode
                key={person.id}
                person={person}
                childrenById={childrenById}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
