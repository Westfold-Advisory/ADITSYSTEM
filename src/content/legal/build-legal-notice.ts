import type { InstitutionTheme } from "@/config/institution";

export type LegalNoticeContent = {
  version: string;
  effectiveDate: string;
  title: string;
  summary: string;
  sections: { id: string; title: string; body: string[] }[];
};

const LEGAL_VERSION = "1.0.0";
const LEGAL_EFFECTIVE_DATE = "2026-09-20";

export function buildLegalNotice(theme: InstitutionTheme): LegalNoticeContent {
  const isDemo = theme.deploymentKind === "demo";
  const demoDisclaimer = theme.demoDisclaimer;

  if (isDemo && demoDisclaimer) {
    return {
      version: LEGAL_VERSION,
      effectiveDate: LEGAL_EFFECTIVE_DATE,
      title: "Aviso legal",
      summary: demoDisclaimer,
      sections: [
        {
          id: "caracter",
          title: "Carácter del sitio",
          body: [
            `${theme.productName} se presenta como entorno demostrativo operado con fines de evaluación y capacitación.`,
            demoDisclaimer,
            "Los nombres de instituciones, personas, territorios y eventos pueden ser ficticios.",
          ],
        },
        {
          id: "propiedad",
          title: "Propiedad intelectual",
          body: [
            `El software, la interfaz y la documentación asociada a ${theme.productName} están protegidos por las leyes aplicables.`,
            theme.footer.copyright ??
              `© ${theme.productName}. Todos los derechos reservados.`,
          ],
        },
        {
          id: "limitacion",
          title: "Limitación de responsabilidad",
          body: [
            "La información publicada en este entorno no constituye asesoría legal, fiscal ni electoral.",
            "El Responsable del despliegue de demostración no garantiza disponibilidad continua ni ausencia de errores en datos ficticios.",
          ],
        },
        {
          id: "enlaces",
          title: "Enlaces externos",
          body: [
            "Los enlaces a sitios de terceros, si existieran, se proporcionan solo para referencia; no implican respaldo institucional.",
          ],
        },
        {
          id: "privacidad",
          title: "Privacidad",
          body: [
            `El tratamiento de datos personales se describe en el aviso de privacidad disponible en ${theme.legal.privacyIntegralPath}.`,
          ],
        },
      ],
    };
  }

  return {
    version: LEGAL_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    title: "Aviso legal",
    summary: `Información legal sobre el uso de ${theme.productName} en el despliegue de ${theme.institutionName}.`,
    sections: [
      {
        id: "titular",
        title: "Titular del sitio",
        body: [
          `${theme.institutionName} publica este sitio en el marco del despliegue de ${theme.productName}.`,
          contactLine(theme),
        ],
      },
      {
        id: "uso",
        title: "Uso permitido",
        body: [
          "El acceso administrativo está restringido a personas autorizadas. El uso público se limita a las secciones expresamente abiertas.",
        ],
      },
      {
        id: "privacidad",
        title: "Privacidad",
        body: [
          `Consulte el aviso de privacidad en ${theme.legal.privacyIntegralPath}.`,
        ],
      },
    ],
  };
}

function contactLine(theme: InstitutionTheme): string {
  if (theme.contact.email) {
    return `Contacto: ${theme.contact.email}.`;
  }
  return "Contacto: utilice el canal publicado por la institución responsable.";
}
