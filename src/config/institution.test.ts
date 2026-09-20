import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { InstitutionBrandMark } from "@/components/InstitutionBrandMark";
import { PublicAppShell } from "@/components/PublicAppShell";
import {
  ADITSYSTEM_INSTITUTION_THEME,
  buildInstitutionTheme,
} from "./institution";

test("buildInstitutionTheme usa ADITSYSTEM por defecto sin variables", () => {
  assert.deepEqual(buildInstitutionTheme({}), ADITSYSTEM_INSTITUTION_THEME);
});

test("buildInstitutionTheme aplica overrides DIF desde entorno mock", () => {
  const difTheme = buildInstitutionTheme({
    VITE_INSTITUTION_PRODUCT_NAME: "Portal DIF",
    VITE_INSTITUTION_NAME: "Sistema Estatal DIF — Ejemplo",
    VITE_INSTITUTION_LOGO_URL: "https://example.test/dif-logo.svg",
    VITE_INSTITUTION_LOGO_ALT: "Logotipo del DIF estatal",
    VITE_INSTITUTION_CONTACT_EMAIL: "contacto@dif.ejemplo.gob.mx",
    VITE_INSTITUTION_CONTACT_PHONE: "+52 55 1234 5678",
    VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH: "/aviso-privacidad",
    VITE_INSTITUTION_PRIVACY_SUMMARY_PATH: "/aviso-privacidad/resumen",
    VITE_INSTITUTION_TERMS_PATH: "/terminos",
  });

  assert.equal(difTheme.productName, "Portal DIF");
  assert.equal(difTheme.institutionName, "Sistema Estatal DIF — Ejemplo");
  assert.equal(difTheme.logoUrl, "https://example.test/dif-logo.svg");
  assert.equal(difTheme.logoAlt, "Logotipo del DIF estatal");
  assert.equal(difTheme.contact.email, "contacto@dif.ejemplo.gob.mx");
  assert.equal(difTheme.legal.termsOfUsePath, "/terminos");
});

test("PublicAppShell renderiza marca institucional mock (snapshot markup)", () => {
  const institution = buildInstitutionTheme({
    VITE_INSTITUTION_PRODUCT_NAME: "Portal DIF",
    VITE_INSTITUTION_LOGO_URL: "https://example.test/dif-logo.svg",
    VITE_INSTITUTION_LOGO_ALT: "Logotipo del DIF estatal",
    VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH: "/aviso-privacidad",
  });

  const brandMarkup = renderToStaticMarkup(
    createElement(InstitutionBrandMark, { institution }),
  );
  assert.match(brandMarkup, /Portal DIF/);
  assert.match(brandMarkup, /alt="Logotipo del DIF estatal"/);
  assert.match(brandMarkup, /src="https:\/\/example.test\/dif-logo.svg"/);

  const shellMarkup = renderToStaticMarkup(
    createElement(
      PublicAppShell,
      {
        institution,
        currentPath: "/eventos",
      },
      createElement("p", null, "Contenido"),
    ),
  );
  assert.match(shellMarkup, /Portal DIF/);
  assert.match(shellMarkup, /Logotipo del DIF estatal/);
  assert.match(shellMarkup, /href="\/aviso-privacidad"/);
});
