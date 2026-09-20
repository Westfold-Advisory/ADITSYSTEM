import type { PrivacyNoticeContent } from "./types";

/** Aviso simplificado — resumen de alto nivel (LFPDPPP). */
export const privacyNoticeSimplificado: PrivacyNoticeContent = {
  kind: "simplificado",
  version: "1.0.0",
  effectiveDate: "2026-09-20",
  title: "Aviso de privacidad simplificado",
  summary:
    "Resumen del tratamiento de datos personales en ADIT SYSTEM. Para el detalle completo, consulte el aviso integral.",
  sections: [
    {
      id: "quien",
      title: "¿Quién es responsable?",
      placeholder: false,
      body: [
        "Westfold Advisory es responsable del tratamiento de los datos personales recabados a través de ADIT SYSTEM en el entorno de despliegue operado por dicha entidad.",
        "Para asuntos de privacidad puede escribir a privacidad@westfoldadvisory.com.",
      ],
    },
    {
      id: "para-que",
      title: "¿Para qué usamos sus datos?",
      placeholder: false,
      body: [
        "Utilizamos datos personales para operar la plataforma: autenticación y control de acceso; administración de personas, relaciones organizacionales y territorio; gestión de eventos, documentos e imágenes; y funciones de mapa y reportes necesarias para las tareas autorizadas.",
        "No utilizamos sus datos para finalidades incompatibles con las anteriores sin informarle cuando la ley lo exija.",
      ],
    },
    {
      id: "derechos",
      title: "Sus derechos",
      placeholder: false,
      body: [
        "Usted puede solicitar acceso, rectificación, cancelación u oposición (derechos ARCO), así como revocar su consentimiento cuando aplique, enviando una solicitud al correo indicado arriba.",
        "Atenderemos su solicitud en los plazos previstos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
      ],
    },
    {
      id: "integral",
      title: "Aviso integral",
      placeholder: false,
      body: ["La versión completa del aviso está disponible en /privacidad."],
    },
  ],
};
