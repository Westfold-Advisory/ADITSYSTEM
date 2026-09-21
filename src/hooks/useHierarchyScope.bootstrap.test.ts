import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

/** UX-02 (TRA-142 P0.3): no auto-selection on hierarchy bootstrap. */
test("useHierarchyScope does not setSelected on initial getPerson bootstrap", () => {
  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    "useHierarchyScope.ts",
  );
  const source = readFileSync(path, "utf8");
  const bootstrap = source.slice(
    source.indexOf("const current = await api.getPerson"),
    source.indexOf("await loadChildren(current, current)"),
  );
  assert.doesNotMatch(bootstrap, /setSelected\s*\(\s*current\s*\)/);
});
