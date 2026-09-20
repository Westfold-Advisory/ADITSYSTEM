import assert from "node:assert/strict";
import test from "node:test";

import { capabilitiesFor } from "./capabilities";

test("capabilities follow the final authenticated hierarchy", () => {
  assert.equal(capabilitiesFor("COORDINADOR_GENERAL").childRole, "COORDINADOR");
  assert.equal(capabilitiesFor("COORDINADOR").childRole, "ENLACE");
  assert.equal(capabilitiesFor("ENLACE").childRole, "AMIGO");
});
