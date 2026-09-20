import type { CommunityNeed } from "@/types/domain";
import { COMMUNITY_NEEDS } from "@/types/domain";

const labels: Record<CommunityNeed, string> = {
  INSEGURIDAD: "Inseguridad",
  FALTA_ALUMBRADO_PUBLICO: "Falta de alumbrado público",
  CALLES_MAL_ESTADO: "Calles en mal estado",
  FALTA_AGUA_POTABLE: "Falta de agua potable",
  PROBLEMAS_DRENAJE: "Problemas de drenaje",
  RECOLECCION_BASURA_DEFICIENTE: "Recolección de basura deficiente",
  FALTA_LIMPIEZA: "Falta de limpieza",
  FALTA_TRANSPORTE_PUBLICO: "Falta de transporte público",
  FALTA_PARQUES_ESPACIOS_RECREATIVOS: "Falta de parques o espacios recreativos",
  VENTA_CONSUMO_DROGAS: "Venta o consumo de drogas",
  FALTA_ATENCION_MEDICA_CERCANA: "Falta de atención médica cercana",
  FALTA_APOYOS_SOCIALES: "Falta de apoyos sociales",
  FALTA_EMPLEO: "Falta de empleo",
  FALTA_ATENCION_ADULTOS_MAYORES: "Falta de atención a adultos mayores",
  FALTA_ATENCION_JOVENES: "Falta de atención a jóvenes",
};

export function communityNeedLabel(need: CommunityNeed): string {
  return labels[need];
}

export const communityNeedOptions = COMMUNITY_NEEDS.map((need) => ({
  value: need,
  label: labels[need],
}));
