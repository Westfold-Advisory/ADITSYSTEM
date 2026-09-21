import assert from "node:assert/strict";
import test from "node:test";

import { publicUiCopy } from "./public-ui-es";

test("publicUiCopy layer messages avoid internal implementation references", () => {
  const text = publicUiCopy.capas.emptyCatalog;
  assert.doesNotMatch(text, /\bTRA-\d+/);
  assert.doesNotMatch(text, /GitHub/i);
  assert.doesNotMatch(text, /\bRDS\b/i);
  assert.doesNotMatch(text, /\bdev\b/i);
  assert.doesNotMatch(text, /disco/i);
});
