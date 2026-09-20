import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PersonStatusBadge } from "./PersonStatusBadge";

test("PersonStatusBadge exposes readable status label", () => {
  const markup = renderToStaticMarkup(
    createElement(PersonStatusBadge, { status: "ACTIVO" }),
  );
  assert.match(markup, />Activo</);
  assert.match(markup, /person-status-badge--activo/);
});
