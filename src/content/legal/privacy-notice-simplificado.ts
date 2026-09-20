import type { PrivacyNoticeContent } from "./types";

/**
 * Aviso simplificado — resumen de alto nivel para enlaces desde login y footer.
 * LEGAL REVIEW REQUIRED.
 */
export const privacyNoticeSimplificado: PrivacyNoticeContent = {
  kind: "simplificado",
  version: "0.1.0-draft",
  effectiveDate: "2026-01-01",
  title: "Aviso de privacidad simplificado",
  summary:
    "Resumen orientativo. Consulte el aviso integral para el detalle completo de tratamientos y derechos.",
  sections: [
    {
      id: "quien",
      title: "¿Quién es responsable?",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Nombre del responsable y contacto breve.",
      ],
    },
    {
      id: "para-que",
      title: "¿Para qué usamos sus datos?",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Finalidades principales en lenguaje claro (administrar personas, eventos, acceso al sistema).",
      ],
    },
    {
      id: "derechos",
      title: "Sus derechos",
      placeholder: true,
      body: ["[PO — LEGAL REVIEW REQUIRED] Derechos ARCO y cómo contactarnos."],
    },
    {
      id: "integral",
      title: "Aviso integral",
      placeholder: false,
      body: [
        "La versión completa del aviso está disponible en la ruta /privacidad del sitio.",
      ],
    },
  ],
};
