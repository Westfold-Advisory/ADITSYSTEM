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
