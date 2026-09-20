import type { PersonRole } from "@/types/domain";

export function roleLabel(role: PersonRole): string {
  return role.toLowerCase().replaceAll("_", " ");
}
