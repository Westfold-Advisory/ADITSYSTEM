import assert from "node:assert/strict";
import test from "node:test";

import { adminUiCopy } from "./admin-ui-es";
import { publicUiCopy } from "./public-ui-es";

/** docs/design-system/08-content-vocabulary.md §5 — Lista negra. */
const BLACKLIST: RegExp[] = [
  /\bbackend\b/i,
  /\bfrontend\b/i,
  /\bAPI\b/,
  /\bendpoint\b/i,
  /\bheatmap\b/i,
  /\bpin\b/i,
  /\bsub[aá]rbol\b/i,
  /\bsubmit\b/i,
  /\btoken\b/i,
  /\b422\b/,
  /\b500\b/,
  /\bUUID\b/i,
  /\bJSON\b/i,
  /\bfetch\b/i,
  /\bhook\b/i,
];

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
  } else if (typeof value === "function") {
    out.push(String(value("Ejemplo")));
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectStrings(entry, out);
  }
}

test("content copy modules avoid blacklisted technical jargon", () => {
  const strings: string[] = [];
  collectStrings(adminUiCopy, strings);
  collectStrings(publicUiCopy, strings);

  assert.ok(strings.length > 0, "expected at least one copy string to check");

  for (const text of strings) {
    for (const pattern of BLACKLIST) {
      assert.doesNotMatch(text, pattern, `"${text}" matched ${pattern}`);
    }
  }
});
