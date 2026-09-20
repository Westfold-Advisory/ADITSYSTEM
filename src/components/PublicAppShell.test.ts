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
  assert.doesNotMatch(markup, /--cyber-/);
});

test("Eventos is the only primary nav destination; Mapa and login are secondary/tertiary", () => {
  const markup = renderToStaticMarkup(
    createElement(
      PublicAppShell,
      { currentPath: "/eventos" },
      createElement("p", null, "Contenido"),
    ),
  );

  const navMatch = markup.match(/<nav class="ui-navigation"[^>]*>(.*?)<\/nav>/);
  assert.ok(navMatch, "expected a primary navigation landmark");
  const primaryNav = navMatch[1];
  assert.match(primaryNav, /href="\/eventos"/);
  assert.doesNotMatch(primaryNav, /href="\/mapa"/);

  assert.match(markup, /class="public-app-shell__map-link"/);
  assert.match(markup, /class="public-app-shell__auth-action"/);
  assert.match(markup, /Ver mapa/);
  assert.match(markup, /Personal autorizado/);
});
