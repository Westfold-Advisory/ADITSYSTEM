import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AppBar, Navigation } from "./ui/AppBar";

test("global app bar exposes active, accessible public navigation", () => {
  const navigation = renderToStaticMarkup(
    createElement(
      AppBar,
      {
        brand: "ADIT SYSTEM",
        actions: createElement("a", { href: "/admin" }, "Iniciar sesión"),
      },
      createElement(
        Navigation,
        null,
        createElement(
          "a",
          { href: "/eventos", "aria-current": "page" },
          "Eventos",
        ),
        createElement("a", { href: "/mapa" }, "Mapa"),
      ),
    ),
  );
  assert.match(
    navigation,
    /<nav class="ui-navigation" aria-label="Navegación principal">/,
  );
  assert.match(navigation, /href="\/eventos" aria-current="page"/);
  assert.match(navigation, /Iniciar sesión/);
  assert.doesNotMatch(navigation, /Administración/);
});
