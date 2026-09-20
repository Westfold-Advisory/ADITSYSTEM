import type { InstitutionTheme } from "@/config/institution";
import type { PrivacyNoticeContent, PrivacyNoticeKind } from "./types";

const NOTICE_VERSION = "1.1.0";
const NOTICE_EFFECTIVE_DATE = "2026-09-20";

function demoSummary(theme: InstitutionTheme): string {
  const lead = theme.demoDisclaimer ?? "";
  return `${lead} Documento orientativo para ${theme.productName}.`;
}

function clientSummary(theme: InstitutionTheme): string {
  return `Aviso de privacidad de ${theme.productName}. Este documento describe cómo ${theme.privacyResponsible} trata datos personales en el despliegue de la plataforma.`;
}

function contactLine(theme: InstitutionTheme): string {
  if (theme.contact.email) {
    return `Medio de contacto para privacidad: ${theme.contact.email}.`;
  }
  return "Medio de contacto para privacidad: utilice el canal publicado por la institución responsable del despliegue.";
}

export function buildPrivacyNotice(
  kind: PrivacyNoticeKind,
  theme: InstitutionTheme,
): PrivacyNoticeContent {
  const responsible = theme.privacyResponsible;
  const product = theme.productName;
  const isDemo = theme.deploymentKind === "demo";
  const demoNote = theme.demoDisclaimer;

  if (kind === "simplificado") {
    const sections = [
      {
        id: "quien",
        title: "¿Quién es responsable?",
        placeholder: false as const,
        body: [
          `${responsible} es responsable del tratamiento de los datos personales recabados a través de ${product} en este despliegue.`,
          contactLine(theme),
        ],
      },
      {
        id: "para-que",
        title: "¿Para qué usamos sus datos?",
        placeholder: false as const,
        body: [
          `Utilizamos datos personales para operar la plataforma: autenticación; administración de personas, relaciones y territorio; eventos, documentos e imágenes; y funciones de mapa autorizadas.`,
          isDemo
            ? `${demoNote} Los datos mostrados son ficticios con fines de demostración.`
            : "No utilizamos sus datos para finalidades incompatibles con las anteriores sin informarle cuando la ley lo exija.",
        ],
      },
      {
        id: "derechos",
        title: "Sus derechos",
        placeholder: false as const,
        body: [
          "Usted puede solicitar acceso, rectificación, cancelación u oposición (derechos ARCO), así como revocar su consentimiento cuando aplique, mediante el canal de contacto indicado.",
          "Atenderemos su solicitud en los plazos previstos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
        ],
      },
      {
        id: "integral",
        title: "Aviso integral",
        placeholder: false as const,
        body: [
          `La versión completa del aviso está disponible en ${theme.legal.privacyIntegralPath}.`,
        ],
      },
    ];

    return {
      kind: "simplificado",
      version: NOTICE_VERSION,
      effectiveDate: NOTICE_EFFECTIVE_DATE,
      title: "Aviso de privacidad simplificado",
      summary: isDemo ? demoSummary(theme) : clientSummary(theme),
      sections,
    };
  }

  return {
    kind: "integral",
    version: NOTICE_VERSION,
    effectiveDate: NOTICE_EFFECTIVE_DATE,
    title: "Aviso de privacidad integral",
    summary: isDemo ? demoSummary(theme) : clientSummary(theme),
    sections: [
      {
        id: "responsable",
        title: "Responsable del tratamiento de datos personales",
        placeholder: false,
        body: [
          `${responsible} (en adelante, el «Responsable») es la entidad responsable del tratamiento de los datos personales recabados mediante ${product} en este despliegue.`,
          contactLine(theme),
          isDemo && demoNote
            ? demoNote
            : "El domicilio fiscal y datos registrales definitivos del Responsable deben publicarse aquí cuando la institución confirme la información oficial para producción.",
        ],
      },
      {
        id: "datos-recabados",
        title: "Datos personales que recabamos",
        placeholder: false,
        body: [
          "Según el uso autorizado del sistema, podemos tratar: datos de identificación y contacto; información organizacional según el perfil del usuario; datos de eventos y asistencia; documentos, currículums e imágenes cargados; datos territoriales asociados a mapas; y datos técnicos de acceso necesarios para seguridad.",
          isDemo
            ? `${demoNote} No debe ingresar datos personales reales en este entorno.`
            : "No recabamos datos personales sensibles salvo que el servicio lo requiera, usted los proporcione voluntariamente y exista base legal aplicable.",
        ],
      },
      {
        id: "finalidades",
        title: "Finalidades del tratamiento",
        placeholder: false,
        body: [
          "Finalidades primarias: prestar el servicio; administrar cuentas y permisos; gestionar personas, jerarquías, eventos, documentos y mapas; y mantener la seguridad de la plataforma.",
          "Finalidades secundarias: soporte, mejora operativa y estadísticas agregadas cuando sea posible sin identificación directa.",
        ],
      },
      {
        id: "fundamento",
        title: "Fundamento y consentimiento",
        placeholder: false,
        body: [
          "El tratamiento se basa, según el caso, en la relación con el usuario o cliente del Responsable, obligaciones legales, interés legítimo en operar el sistema de forma segura, y consentimiento cuando sea necesario.",
          "Puede revocar el consentimiento cuando el tratamiento dependa de él, sin efectos retroactivos.",
        ],
      },
      {
        id: "transferencias",
        title: "Transferencias y encargados",
        placeholder: false,
        body: [
          "Podemos compartir datos con encargados (por ejemplo, hospedaje o almacenamiento) únicamente para las finalidades descritas y bajo obligaciones de confidencialidad y seguridad.",
          "Si se utilizan servicios fuera de México, aplicaremos las salvaguardas que exija la normativa vigente.",
        ],
      },
      {
        id: "derechos-arco",
        title: "Derechos ARCO y revocación del consentimiento",
        placeholder: false,
        body: [
          "Usted puede ejercer acceso, rectificación, cancelación u oposición, así como revocar el consentimiento, mediante el canal de contacto indicado en este aviso.",
          "El Responsable responderá en los plazos previstos por la LFPDPPP.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies, tecnologías similares y analítica",
        placeholder: false,
        body: [
          "Utilizamos almacenamiento local y cookies estrictamente necesarias para sesión administrativa, preferencias y seguridad.",
          "Si se incorporan analíticas no esenciales, se actualizará este aviso y se solicitará consentimiento cuando corresponda.",
        ],
      },
      {
        id: "seguridad",
        title: "Medidas de seguridad",
        placeholder: false,
        body: [
          "Aplicamos medidas administrativas, técnicas y físicas razonables: control de acceso por roles, cifrado cuando el entorno lo permite y registros de auditoría según configuración.",
        ],
      },
      {
        id: "cambios",
        title: "Cambios al aviso",
        placeholder: false,
        body: [
          `Publicaremos la versión vigente en ${theme.legal.privacyIntegralPath} con fecha de entrada en vigor.`,
          "Los cambios sustanciales se comunicarán por medios razonables.",
        ],
      },
      {
        id: "contacto",
        title: "Contacto",
        placeholder: false,
        body: [
          contactLine(theme),
          "Si considera que su derecho a la protección de datos no fue atendido, puede acudir al INAI.",
        ],
      },
    ],
  };
}
