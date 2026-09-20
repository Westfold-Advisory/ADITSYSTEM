import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getInstitutionConfig } from "@/config/institution";
import { LoginPage } from "./LoginPage";

test("LoginPage muestra identidad institucional y enlaces de privacidad", () => {
  const institution = getInstitutionConfig();
  const markup = renderToStaticMarkup(
    createElement(LoginPage, { onLogin: () => undefined }),
  );

  assert.match(markup, new RegExp(institution.productName));
  assert.match(markup, new RegExp(institution.institutionName));
  assert.match(markup, /Acceso administrativo/);
  assert.match(markup, /href="\/privacidad"/);
  assert.match(markup, /href="\/privacidad\/simplificado"/);
  assert.match(markup, /Correo electrónico/);
  assert.match(markup, /Iniciar sesión/);
  assert.doesNotMatch(markup, /class="login-form"/);
});
