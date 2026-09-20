import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PublicAppShell } from "./PublicAppShell";

test("PublicAppShell exposes skip link, main landmark, nav and legal footer", () => {
  const markup = renderToStaticMarkup(
    createElement(
      PublicAppShell,
      { currentPath: "/mapa" },
      createElement("p", null, "Contenido"),
    ),
  );

  assert.match(markup, /Saltar al contenido principal/);
  assert.match(markup, /href="#public-main-content"/);
  assert.match(markup, /<main id="public-main-content"/);
  assert.match(markup, /href="\/mapa" aria-current="page"/);
  assert.match(markup, /href="\/eventos"(?! aria-current)/);
  assert.match(markup, /role="contentinfo"/);
  assert.match(markup, /Aviso de privacidad/);
  assert.match(markup, /Aviso legal/);
  assert.match(markup, /Entorno demostrativo/);
  assert.doesNotMatch(markup, /--cyber-/);
});

test("Public shell groups Eventos and Mapa in nav; login stays in actions", () => {
  const markup = renderToStaticMarkup(
    createElement(
      PublicAppShell,
      { currentPath: "/eventos" },
      createElement("p", null, "Contenido"),
    ),
  );

  const navMatch = markup.match(
    /<nav class="ui-navigation public-app-shell__nav"[^>]*>(.*?)<\/nav>/,
  );
  assert.ok(navMatch, "expected a primary navigation landmark");
  const primaryNav = navMatch[1];
  assert.match(primaryNav, /href="\/eventos"/);
  assert.match(primaryNav, /href="\/mapa"/);
  assert.match(primaryNav, /Mapa/);

  assert.match(markup, /class="public-app-shell__auth-action"/);
  assert.match(markup, /Personal autorizado/);
  assert.doesNotMatch(markup, /class="public-app-shell__map-link"/);
});

test("PublicAppShell auth variant omits public nav and offers return to eventos", () => {
  const markup = renderToStaticMarkup(
    createElement(
      PublicAppShell,
      { variant: "auth" },
      createElement("p", null, "Login"),
    ),
  );

  assert.match(markup, /public-app-shell--auth/);
  assert.match(markup, /Eventos públicos/);
  assert.match(markup, /href="\/eventos"/);
  assert.doesNotMatch(markup, /Personal autorizado/);
  assert.doesNotMatch(markup, /Mapa/);
  assert.doesNotMatch(markup, /public-app-shell__nav/);
  assert.match(markup, /Saltar al contenido principal/);
  assert.match(markup, /<main id="public-main-content"/);
});
