/** Metadatos compartidos por variantes del aviso (integral / simplificado). */

export type PrivacyNoticeKind = "integral" | "simplificado";

export type PrivacyNoticeSection = {
  id: string;
  title: string;
  body: string[];
  /** Sección pendiente de redacción jurídica por el PO / área legal. */
  placeholder?: boolean;
};

export type PrivacyNoticeContent = {
  kind: PrivacyNoticeKind;
  version: string;
  /** Fecha de entrada en vigor (ISO 8601, solo fecha). */
  effectiveDate: string;
  title: string;
  summary: string;
  sections: PrivacyNoticeSection[];
};
