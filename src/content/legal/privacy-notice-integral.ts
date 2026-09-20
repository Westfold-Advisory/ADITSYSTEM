import type { PrivacyNoticeContent } from "./types";

/** Aviso de privacidad integral — contenido mínimo estándar (LFPDPPP-oriented). */
export const privacyNoticeIntegral: PrivacyNoticeContent = {
  kind: "integral",
  version: "1.0.0",
  effectiveDate: "2026-09-20",
  title: "Aviso de privacidad integral",
  summary:
    "Aviso de privacidad de ADIT SYSTEM. Este documento describe cómo Westfold Advisory trata datos personales en el despliegue de la plataforma.",
  sections: [
    {
      id: "responsable",
      title: "Responsable del tratamiento de datos personales",
      placeholder: false,
      body: [
        "Westfold Advisory (en adelante, el «Responsable») es la entidad responsable del tratamiento de los datos personales recabados mediante ADIT SYSTEM en el entorno bajo su operación.",
        "Medio de contacto para privacidad: privacidad@westfoldadvisory.com.",
        "El domicilio fiscal y datos registrales definitivos del Responsable deben publicarse aquí cuando el Product Owner confirme la razón social y domicilio oficiales para el despliegue en producción.",
      ],
    },
    {
      id: "datos-recabados",
      title: "Datos personales que recabamos",
      placeholder: false,
      body: [
        "Según el uso autorizado del sistema, podemos tratar: datos de identificación y contacto; información laboral, organizacional o de afiliación según el perfil del usuario; datos de eventos, asistencia y check-in; documentos, currículums e imágenes cargados en el sistema; datos de geolocalización o territorio asociados a mapas y cobertura; y datos técnicos de acceso (por ejemplo, identificadores de sesión y registros de actividad necesarios para seguridad).",
        "No recabamos datos personales sensibles salvo que el servicio lo requiera, usted los proporcione voluntariamente y exista base legal aplicable.",
      ],
    },
    {
      id: "finalidades",
      title: "Finalidades del tratamiento",
      placeholder: false,
      body: [
        "Finalidades primarias: prestar el servicio de ADIT SYSTEM; administrar cuentas y permisos; gestionar personas, jerarquías, eventos, documentos y mapas; cumplir obligaciones derivadas de la relación con usuarios autorizados; y mantener la seguridad e integridad de la plataforma.",
        "Finalidades secundarias: mejora operativa y soporte, estadísticas agregadas sin identificación directa cuando sea posible, y comunicaciones relacionadas con el servicio. Las finalidades secundarias distintas de las primarias, cuando la ley lo exija, se informarán o solicitarán consentimiento aparte.",
      ],
    },
    {
      id: "fundamento",
      title: "Fundamento y consentimiento",
      placeholder: false,
      body: [
        "El tratamiento se basa, según el caso, en la ejecución de la relación con el usuario o cliente del Responsable, el cumplimiento de obligaciones legales, el interés legítimo del Responsable en asegurar y operar el sistema (equilibrado con sus derechos), y su consentimiento cuando sea necesario.",
        "Al registrarse o utilizar funciones que impliquen tratamiento, usted reconoce haber leído este aviso. Puede revocar el consentimiento cuando el tratamiento dependa de él, sin efectos retroactivos.",
      ],
    },
    {
      id: "transferencias",
      title: "Transferencias y encargados",
      placeholder: false,
      body: [
        "Podemos compartir datos con proveedores que actúan como encargados (por ejemplo, hospedaje en nube, almacenamiento de archivos o servicios de correo), únicamente para las finalidades descritas y bajo obligaciones de confidencialidad y seguridad.",
        "No realizamos transferencias internacionales salvo que se utilicen servicios ubicados fuera de México; en ese caso aplicaremos las salvaguardas que exija la normativa vigente e informaremos en esta sección el detalle del proveedor cuando corresponda al despliegue.",
      ],
    },
    {
      id: "derechos-arco",
      title: "Derechos ARCO y revocación del consentimiento",
      placeholder: false,
      body: [
        "Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos, así como a revocar el consentimiento y limitar el uso cuando proceda.",
        "Envíe su solicitud a privacidad@westfoldadvisory.com indicando su nombre, medio de contacto, descripción del derecho que desea ejercer y copia de identificación oficial cuando sea necesario para verificar su identidad.",
        "El Responsable responderá en un plazo máximo de veinte días hábiles contados desde la recepción de la solicitud completa, prorrogables una vez por el mismo periodo cuando la ley lo permita.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies, tecnologías similares y analítica",
      placeholder: false,
      body: [
        "Utilizamos almacenamiento local y cookies estrictamente necesarias para mantener la sesión administrativa, preferencias de interfaz y seguridad. No empleamos cookies de publicidad en la versión actual.",
        "Si en el futuro se incorporan analíticas o cookies no esenciales, se actualizará este aviso y, cuando corresponda, se solicitará consentimiento.",
      ],
    },
    {
      id: "seguridad",
      title: "Medidas de seguridad",
      placeholder: false,
      body: [
        "Implementamos medidas administrativas, técnicas y físicas razonables acordes al entorno de despliegue: control de acceso basado en roles, comunicación cifrada cuando el entorno lo permite, respaldos y registros de auditoría según configuración del sistema.",
        "Ningún sistema es infalible; reporte incidentes de seguridad al mismo canal de contacto de privacidad.",
      ],
    },
    {
      id: "cambios",
      title: "Cambios al aviso",
      placeholder: false,
      body: [
        "Podemos modificar este aviso para reflejar cambios legales o del servicio. Publicaremos la versión vigente en /privacidad con fecha de entrada en vigor.",
        "Los cambios sustanciales se comunicarán por medios razonables (aviso en el sistema o correo a usuarios registrados cuando aplique).",
      ],
    },
    {
      id: "contacto",
      title: "Contacto",
      placeholder: false,
      body: [
        "Para dudas sobre este aviso o el ejercicio de sus derechos: privacidad@westfoldadvisory.com.",
        "Si considera que su derecho a la protección de datos no fue atendido, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).",
      ],
    },
  ],
};
