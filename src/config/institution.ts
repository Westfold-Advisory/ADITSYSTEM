/**
 * Identidad institucional themable (stub — valores finales vía PO / despliegue).
 */
export type InstitutionConfig = {
  productName: string;
  institutionName: string;
  privacyIntegralPath: string;
  privacySummaryPath: string;
};

const defaultInstitutionConfig: InstitutionConfig = {
  productName: "ADIT SYSTEM",
  institutionName: "[PO — Nombre de la institución responsable del despliegue]",
  privacyIntegralPath: "/privacidad",
  privacySummaryPath: "/privacidad/simplificado",
};

export function getInstitutionConfig(): InstitutionConfig {
  return defaultInstitutionConfig;
}
