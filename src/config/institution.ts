/**
 * Identidad institucional y presentación por despliegue (`VITE_INSTITUTION_*`, `VITE_DEPLOYMENT_*`).
 * Separado de producto (ADIT SYSTEM) y del proveedor tecnológico.
 */

export type InstitutionContact = {
  email: string | null;
  phone: string | null;
};

export type InstitutionLegalLinks = {
  privacyIntegralPath: string;
  privacySummaryPath: string;
  /** Ruta del aviso legal (distinto del aviso de privacidad). */
  legalNoticePath: string | null;
  /** @deprecated Usar `legalNoticePath`. */
  termsOfUsePath: string | null;
};

export type DeploymentKind = "demo" | "client";

export type FooterSegment =
  | { type: "text"; label: string }
  | { type: "link"; label: string; href: string };

export type LoginPrivacyPresentation = {
  heading: string;
  paragraphs: string[];
  cta: { label: string; href: string };
};

export type FooterPresentation = {
  segments: FooterSegment[];
  copyright: string | null;
};

/** Configuración de marca e identidad para una institución desplegada. */
export type InstitutionTheme = {
  productName: string;
  institutionName: string;
  /** Línea secundaria bajo la institución (p. ej. «Entorno demostrativo»). */
  environmentTagline: string | null;
  deploymentKind: DeploymentKind;
  /** Responsable del tratamiento en avisos LFPDPPP (puede coincidir con `institutionName`). */
  privacyResponsible: string;
  /** Aviso visible en superficies de privacidad cuando `deploymentKind === "demo"`. */
  demoDisclaimer: string | null;
  logoUrl: string | null;
  logoAlt: string;
  contact: InstitutionContact;
  legal: InstitutionLegalLinks;
  loginPrivacy: LoginPrivacyPresentation;
  footer: FooterPresentation;
};

/** @deprecated Prefer `InstitutionTheme`. */
export type InstitutionConfig = InstitutionTheme;

export const DEMO_ENVIRONMENT_DISCLAIMER =
  "Este es un entorno demostrativo y utiliza información ficticia. No ingreses datos personales reales.";

const DEMO_INSTITUTION_NAME = "Instituto Demo de Gestión Ciudadana";
const DEMO_ENVIRONMENT_TAGLINE = "Entorno demostrativo";

export const ADITSYSTEM_INSTITUTION_THEME: InstitutionTheme =
  buildDemoInstitutionTheme();

type EnvSource = Record<string, string | boolean | undefined>;

function envString(source: EnvSource, key: string, fallback: string): string {
  const raw = source?.[key];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function envOptionalString(source: EnvSource, key: string): string | null {
  const raw = source?.[key];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function envDeploymentKind(source: EnvSource): DeploymentKind {
  const raw = envString(source, "VITE_DEPLOYMENT_KIND", "demo").toLowerCase();
  return raw === "client" ? "client" : "demo";
}

function viteEnvSource(): EnvSource {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  return {};
}

function buildLoginPrivacyPresentation(input: {
  deploymentKind: DeploymentKind;
  productName: string;
  privacyIntegralPath: string;
  demoDisclaimer: string | null;
}): LoginPrivacyPresentation {
  if (input.deploymentKind === "demo" && input.demoDisclaimer) {
    return {
      heading: "Privacidad y protección de datos",
      paragraphs: [
        input.demoDisclaimer,
        `Consulta el aviso de privacidad para conocer cómo funciona el tratamiento de información en ${input.productName}.`,
      ],
      cta: {
        label: "Aviso de privacidad",
        href: input.privacyIntegralPath,
      },
    };
  }

  return {
    heading: "Privacidad y protección de datos",
    paragraphs: [
      `Consulta el aviso de privacidad para conocer cómo funciona el tratamiento de información en ${input.productName}.`,
    ],
    cta: {
      label: "Aviso de privacidad",
      href: input.privacyIntegralPath,
    },
  };
}

function buildFooterPresentation(input: {
  deploymentKind: DeploymentKind;
  productName: string;
  environmentTagline: string | null;
  privacyIntegralPath: string;
  privacySummaryPath: string;
  legalNoticePath: string | null;
  copyrightHolder: string;
  copyrightYear: number;
}): FooterPresentation {
  if (input.deploymentKind === "demo") {
    const tagline = input.environmentTagline ?? DEMO_ENVIRONMENT_TAGLINE;
    const segments: FooterSegment[] = [
      { type: "text", label: input.productName },
      { type: "text", label: tagline },
      {
        type: "link",
        label: "Aviso de privacidad",
        href: input.privacyIntegralPath,
      },
    ];
    if (input.legalNoticePath) {
      segments.push({
        type: "link",
        label: "Aviso legal",
        href: input.legalNoticePath,
      });
    }
    return {
      segments,
      copyright: `© ${input.copyrightYear} ${input.copyrightHolder}. Todos los derechos reservados.`,
    };
  }

  const segments: FooterSegment[] = [
    { type: "link", label: "Mapa", href: "/mapa" },
    {
      type: "link",
      label: "Aviso de privacidad",
      href: input.privacyIntegralPath,
    },
    {
      type: "link",
      label: "Resumen de privacidad",
      href: input.privacySummaryPath,
    },
  ];
  if (input.legalNoticePath) {
    segments.push({
      type: "link",
      label: "Aviso legal",
      href: input.legalNoticePath,
    });
  }

  return {
    segments,
    copyright: `© ${input.copyrightYear} ${input.copyrightHolder}. Todos los derechos reservados.`,
  };
}

function buildDemoInstitutionTheme(): InstitutionTheme {
  const productName = "ADIT SYSTEM";
  const deploymentKind: DeploymentKind = "demo";
  const institutionName = DEMO_INSTITUTION_NAME;
  const environmentTagline = DEMO_ENVIRONMENT_TAGLINE;
  const privacyResponsible = DEMO_INSTITUTION_NAME;
  const demoDisclaimer = DEMO_ENVIRONMENT_DISCLAIMER;
  const privacyIntegralPath = "/privacidad";
  const privacySummaryPath = "/privacidad/simplificado";
  const legalNoticePath = "/aviso-legal";
  const copyrightHolder = productName;
  const copyrightYear = 2026;

  return {
    productName,
    institutionName,
    environmentTagline,
    deploymentKind,
    privacyResponsible,
    demoDisclaimer,
    logoUrl: null,
    logoAlt: productName,
    contact: {
      email: null,
      phone: null,
    },
    legal: {
      privacyIntegralPath,
      privacySummaryPath,
      legalNoticePath,
      termsOfUsePath: legalNoticePath,
    },
    loginPrivacy: buildLoginPrivacyPresentation({
      deploymentKind,
      productName,
      privacyIntegralPath,
      demoDisclaimer,
    }),
    footer: buildFooterPresentation({
      deploymentKind,
      productName,
      environmentTagline,
      privacyIntegralPath,
      privacySummaryPath,
      legalNoticePath,
      copyrightHolder,
      copyrightYear,
    }),
  };
}

/** Resuelve tema institucional desde un mapa de variables (p. ej. `import.meta.env`). */
export function buildInstitutionTheme(
  source: EnvSource = viteEnvSource(),
): InstitutionTheme {
  const base = ADITSYSTEM_INSTITUTION_THEME;
  const deploymentKind = envDeploymentKind(source);
  const productName = envString(
    source,
    "VITE_INSTITUTION_PRODUCT_NAME",
    base.productName,
  );
  const institutionName = envString(
    source,
    "VITE_INSTITUTION_NAME",
    base.institutionName,
  );
  const environmentTagline =
    deploymentKind === "demo"
      ? envString(
          source,
          "VITE_INSTITUTION_ENVIRONMENT_TAGLINE",
          base.environmentTagline ?? DEMO_ENVIRONMENT_TAGLINE,
        )
      : envOptionalString(source, "VITE_INSTITUTION_ENVIRONMENT_TAGLINE");
  const privacyResponsible = envString(
    source,
    "VITE_INSTITUTION_PRIVACY_RESPONSIBLE",
    institutionName,
  );
  const demoDisclaimer =
    deploymentKind === "demo"
      ? envString(
          source,
          "VITE_INSTITUTION_DEMO_DISCLAIMER",
          base.demoDisclaimer ?? DEMO_ENVIRONMENT_DISCLAIMER,
        )
      : null;
  const logoUrl = envOptionalString(source, "VITE_INSTITUTION_LOGO_URL");
  const logoAlt = envString(
    source,
    "VITE_INSTITUTION_LOGO_ALT",
    logoUrl ? `${productName} — ${institutionName}` : base.logoAlt,
  );
  const privacyIntegralPath = envString(
    source,
    "VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH",
    base.legal.privacyIntegralPath,
  );
  const privacySummaryPath = envString(
    source,
    "VITE_INSTITUTION_PRIVACY_SUMMARY_PATH",
    base.legal.privacySummaryPath,
  );
  const legalNoticePath =
    envOptionalString(source, "VITE_INSTITUTION_LEGAL_NOTICE_PATH") ??
    envOptionalString(source, "VITE_INSTITUTION_TERMS_PATH") ??
    base.legal.legalNoticePath;
  const copyrightHolder = envString(
    source,
    "VITE_INSTITUTION_COPYRIGHT_HOLDER",
    deploymentKind === "demo" ? productName : institutionName,
  );
  const copyrightYear = Number.parseInt(
    envString(
      source,
      "VITE_INSTITUTION_COPYRIGHT_YEAR",
      String(new Date().getFullYear()),
    ),
    10,
  );

  return {
    productName,
    institutionName,
    environmentTagline,
    deploymentKind,
    privacyResponsible,
    demoDisclaimer,
    logoUrl,
    logoAlt,
    contact: {
      email:
        envOptionalString(source, "VITE_INSTITUTION_CONTACT_EMAIL") ??
        base.contact.email,
      phone:
        envOptionalString(source, "VITE_INSTITUTION_CONTACT_PHONE") ??
        base.contact.phone,
    },
    legal: {
      privacyIntegralPath,
      privacySummaryPath,
      legalNoticePath,
      termsOfUsePath: legalNoticePath,
    },
    loginPrivacy: buildLoginPrivacyPresentation({
      deploymentKind,
      productName,
      privacyIntegralPath,
      demoDisclaimer,
    }),
    footer: buildFooterPresentation({
      deploymentKind,
      productName,
      environmentTagline,
      privacyIntegralPath,
      privacySummaryPath,
      legalNoticePath,
      copyrightHolder,
      copyrightYear: Number.isFinite(copyrightYear)
        ? copyrightYear
        : new Date().getFullYear(),
    }),
  };
}

export function getInstitutionConfig(): InstitutionTheme {
  return buildInstitutionTheme();
}
