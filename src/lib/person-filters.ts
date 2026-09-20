import type { Person, PersonStatus } from "@/types/domain";

export type PersonStatusFilter = PersonStatus | "TODOS";

export interface PersonFilter {
  text: string;
  status: PersonStatusFilter;
}

export const emptyPersonFilter: PersonFilter = { text: "", status: "TODOS" };

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function fullName(person: Person): string {
  return normalize(
    [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
      .filter(Boolean)
      .join(" "),
  );
}

export function isPersonFilterActive(filter: PersonFilter): boolean {
  return filter.text.trim().length > 0 || filter.status !== "TODOS";
}

export function filterPersonList(
  people: Person[],
  filter: PersonFilter,
): Person[] {
  const term = normalize(filter.text.trim());
  return people.filter((person) => {
    const matchesText = !term || fullName(person).includes(term);
    const matchesStatus =
      filter.status === "TODOS" || person.status === filter.status;
    return matchesText && matchesStatus;
  });
}
