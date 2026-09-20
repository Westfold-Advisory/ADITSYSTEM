import type { Person } from "@/types/domain";

import { nameOf } from "./person-display";

export function HierarchyBreadcrumbs({
  path,
  onNavigate,
}: {
  path: Person[];
  onNavigate: (person: Person) => void;
}) {
  if (path.length === 0) return null;
  return (
    <nav
      aria-label="Ruta de la persona"
      className="breadcrumbs breadcrumbs--interactive"
    >
      <ol>
        {path.map((person, index) => {
          const isLast = index === path.length - 1;
          return (
            <li key={person.id}>
              {index > 0 && (
                <span className="breadcrumb-sep" aria-hidden="true">
                  ›
                </span>
              )}
              {isLast ? (
                <span aria-current="location">{nameOf(person)}</span>
              ) : (
                <button type="button" onClick={() => onNavigate(person)}>
                  {nameOf(person)}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
