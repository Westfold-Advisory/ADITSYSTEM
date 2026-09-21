import { GitBranch, List, Network } from "lucide-react";

export const ORGANIZATION_STRUCTURE_VIEWS = [
  { value: "listado" as const, label: "Listado", Icon: List },
  { value: "arbol" as const, label: "Árbol y detalle", Icon: GitBranch },
  { value: "organigrama" as const, label: "Organigrama", Icon: Network },
] as const;

export type PersonasStructureView =
  (typeof ORGANIZATION_STRUCTURE_VIEWS)[number]["value"];
