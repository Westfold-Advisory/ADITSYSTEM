import assert from "node:assert/strict";
import test from "node:test";

import { normalizePathname } from "./routing";

test("public routes resolve explicitly and unknown routes remain unknown", () => {
  assert.equal(normalizePathname("/"), "/");
  assert.equal(normalizePathname("/eventos/"), "/eventos");
  assert.equal(normalizePathname("/mapa"), "/mapa");
  assert.equal(normalizePathname("/no-existe"), "/no-existe");
});
