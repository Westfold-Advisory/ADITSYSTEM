import type { PrivacyNoticeContent } from "./types";

/**
 * Aviso de privacidad integral — estructura LFPDPPP-oriented.
 * LEGAL REVIEW REQUIRED: sustituir placeholders antes de publicación.
 */
export const privacyNoticeIntegral: PrivacyNoticeContent = {
  kind: "integral",
  version: "0.1.0-draft",
  effectiveDate: "2026-01-01",
  title: "Aviso de privacidad integral",
  summary:
    "Documento orientativo con secciones requeridas para un aviso integral. El texto definitivo debe ser validado por el área legal.",
  sections: [
    {
      id: "responsable",
      title: "Responsable del tratamiento de datos personales",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Identificar al responsable (persona moral o física), domicilio fiscal y medios de contacto oficiales.",
      ],
    },
    {
      id: "datos-recabados",
      title: "Datos personales que recabamos",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Describir categorías de datos tratados en ADIT SYSTEM (identificación, contacto, datos laborales o políticos según aplique, geolocalización en mapas, documentos, fotografías, etc.).",
      ],
    },
    {
      id: "finalidades",
      title: "Finalidades del tratamiento",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Enumerar finalidades primarias (operación del sistema, gestión de personas y eventos, autenticación) y secundarias, si las hubiera, con base en consentimiento u otro fundamento aplicable.",
      ],
    },
    {
      id: "fundamento",
      title: "Fundamento y consentimiento",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Precisar bases legales del tratamiento y mecanismos de consentimiento cuando corresponda.",
      ],
    },
    {
      id: "transferencias",
      title: "Transferencias y encargados",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Indicar si existen transferencias nacionales o internacionales, encargados (por ejemplo, proveedores cloud) y salvaguardas.",
      ],
    },
    {
      id: "derechos-arco",
      title: "Derechos ARCO y revocación del consentimiento",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Explicar cómo ejercer acceso, rectificación, cancelación y oposición, plazos de respuesta y canal de contacto (correo o formulario).",
      ],
    },
    {
      id: "cookies",
      title: "Cookies, tecnologías similares y analítica",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Describir uso de cookies o almacenamiento local estrictamente necesario (por ejemplo, sesión administrativa) y cualquier analítica futura.",
      ],
    },
    {
      id: "seguridad",
      title: "Medidas de seguridad",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Resumen de medidas administrativas, técnicas y físicas aplicables al entorno de despliegue.",
      ],
    },
    {
      id: "cambios",
      title: "Cambios al aviso",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Procedimiento de notificación de cambios y dónde consultar versiones anteriores.",
      ],
    },
    {
      id: "contacto",
      title: "Contacto",
      placeholder: true,
      body: [
        "[PO — LEGAL REVIEW REQUIRED] Correo o medio institucional para dudas sobre privacidad y ejercicio de derechos. No incluir datos personales reales en este borrador.",
      ],
    },
  ],
};
