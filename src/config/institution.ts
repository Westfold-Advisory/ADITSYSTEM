/**
 * Identidad institucional themable por despliegue (variables `VITE_INSTITUTION_*`).
 * Valores por defecto: tema ADITSYSTEM.
 */

export type InstitutionContact = {
  email: string | null;
  phone: string | null;
};

export type InstitutionLegalLinks = {
  privacyIntegralPath: string;
  privacySummaryPath: string;
  termsOfUsePath: string | null;
};

/** Configuración de marca e identidad para una institución desplegada. */
export type InstitutionTheme = {
  productName: string;
  institutionName: string;
  logoUrl: string | null;
  logoAlt: string;
  contact: InstitutionContact;
  legal: InstitutionLegalLinks;
};

/** @deprecated Prefer `InstitutionTheme`. */
export type InstitutionConfig = InstitutionTheme;

export const ADITSYSTEM_INSTITUTION_THEME: InstitutionTheme = {
  productName: "ADIT SYSTEM",
  institutionName: "Westfold Advisory",
  logoUrl: null,
  logoAlt: "ADIT SYSTEM",
  contact: {
    email: "privacidad@westfoldadvisory.com",
    phone: null,
  },
  legal: {
    privacyIntegralPath: "/privacidad",
    privacySummaryPath: "/privacidad/simplificado",
    termsOfUsePath: null,
  },
};

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

function viteEnvSource(): EnvSource {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  return {};
}

/** Resuelve tema institucional desde un mapa de variables (p. ej. `import.meta.env`). */
export function buildInstitutionTheme(
  source: EnvSource = viteEnvSource(),
): InstitutionTheme {
  const base = ADITSYSTEM_INSTITUTION_THEME;
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
  const logoUrl = envOptionalString(source, "VITE_INSTITUTION_LOGO_URL");
  const logoAlt = envString(
    source,
    "VITE_INSTITUTION_LOGO_ALT",
    logoUrl ? `${productName} — ${institutionName}` : base.logoAlt,
  );

  return {
    productName,
    institutionName,
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
      privacyIntegralPath: envString(
        source,
        "VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH",
        base.legal.privacyIntegralPath,
      ),
      privacySummaryPath: envString(
        source,
        "VITE_INSTITUTION_PRIVACY_SUMMARY_PATH",
        base.legal.privacySummaryPath,
      ),
      termsOfUsePath:
        envOptionalString(source, "VITE_INSTITUTION_TERMS_PATH") ??
        base.legal.termsOfUsePath,
    },
  };
}

export function getInstitutionConfig(): InstitutionTheme {
  return buildInstitutionTheme();
}
