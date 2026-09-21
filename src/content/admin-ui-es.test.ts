import assert from "node:assert/strict";
import test from "node:test";

import { adminUiCopy } from "./admin-ui-es";

test("adminUiCopy avoids technical jargon in scope notice", () => {
  assert.doesNotMatch(adminUiCopy.personas.scopeNotice, /backend/i);
});

test("adminUiCopy map strings avoid pin and heatmap labels", () => {
  assert.doesNotMatch(adminUiCopy.mapa.pageSubtitle, /\bpin\b/i);
  assert.doesNotMatch(adminUiCopy.mapa.needFilterLabel, /heatmap/i);
});

test("adminUiCopy events use 'dar de baja' instead of 'eliminar' for soft-delete", () => {
  assert.equal(adminUiCopy.eventos.actions.delete, "Dar de baja");
  assert.doesNotMatch(
    adminUiCopy.eventos.confirmDelete("Asamblea"),
    /eliminar/i,
  );
});

test("adminUiCopy documents registration avoids implementation jargon", () => {
  assert.doesNotMatch(adminUiCopy.documentos.registerIntro, /\bS3\b/i);
  assert.doesNotMatch(adminUiCopy.documentos.registerIntro, /binario/i);
});
