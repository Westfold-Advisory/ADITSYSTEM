import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Alert } from "./ui/Alert";
import { LoadingState } from "./ui/AsyncState";
import { Button } from "./ui/button";
import { Field } from "./ui/Field";
import {
  EventDetailSkeleton,
  EventFormSkeleton,
  EventListSkeleton,
  MapControlsSkeleton,
  ResultsPanelSkeleton,
} from "./ui/Skeleton";

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

test("button lifecycle preserves its label and only disables the pending action", () => {
  const button = renderToStaticMarkup(
    createElement(
      Button,
      { variant: "destructive", status: "loading" },
      "Eliminar",
    ),
  );
  assert.match(button, /disabled=""/);
  assert.match(button, /aria-busy="true"/);
  assert.match(button, /Eliminar/);
  assert.match(button, /Acción en progreso/);
  assert.match(button, /focus-visible/);

  const loading = renderToStaticMarkup(
    createElement(LoadingState, { label: "Guardando…" }),
  );
  assert.match(loading, /role="status"/);
  assert.match(loading, /Guardando/);
  assert.match(loading, /ui-skeleton-results/);
});

test("motion tokens and feedback do not force animation for reduced motion", () => {
  const tokens = readFileSync(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  const primitives = readFileSync(
    new URL("../styles/primitives.css", import.meta.url),
    "utf8",
  );
  assert.match(tokens, /prefers-reduced-motion: reduce/);
  assert.match(tokens, /--md-sys-motion-fast: 0ms/);
  assert.match(primitives, /\.ui-button-progress/);
  assert.doesNotMatch(
    primitives.match(/\.ui-button-progress\s*\{[^}]*\}/)?.[0] ?? "",
    /animation:/,
  );
});

test("skeleton primitives reserve content geometry without misleading text", () => {
  const skeletons = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(EventListSkeleton),
      createElement(ResultsPanelSkeleton),
      createElement(EventDetailSkeleton),
      createElement(EventFormSkeleton),
      createElement(MapControlsSkeleton),
    ),
  );
  assert.match(skeletons, /ui-skeleton-card/);
  assert.match(skeletons, /ui-skeleton-form/);
  assert.match(skeletons, /ui-skeleton-map-controls/);
  assert.doesNotMatch(skeletons, /Cargando|evento|resultado/i);
});
