import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Alert } from "./ui/Alert";
import { LoadingState } from "./ui/AsyncState";
import { Button } from "./ui/button";
import { Field } from "./ui/Field";

test("critical primitives expose semantic states and accessible labels", () => {
  const field = renderToStaticMarkup(
    createElement(
      Field,
      { label: "Correo", error: "Formato inválido" },
      createElement("input", { type: "email" }),
    ),
  );
  assert.match(field, /<label for="_R_0_">Correo<\/label>/);
  assert.match(field, /aria-invalid="true"/);
  assert.match(field, /aria-describedby="_R_0_-error"/);

  const error = renderToStaticMarkup(
    createElement(Alert, { tone: "error" }, "Intenta de nuevo."),
  );
  assert.match(error, /role="alert"/);
});

test("button variants preserve focus styling and loading state does not collapse", () => {
  const button = renderToStaticMarkup(
    createElement(
      Button,
      { variant: "destructive", disabled: true, "aria-busy": true },
      "Eliminar",
    ),
  );
  assert.match(button, /disabled=""/);
  assert.match(button, /aria-busy="true"/);
  assert.match(button, /focus-visible/);

  const loading = renderToStaticMarkup(
    createElement(LoadingState, { label: "Guardando…" }),
  );
  assert.match(loading, /role="status"/);
  assert.match(loading, /ui-spinner/);
});
