import assert from "node:assert/strict";
import test from "node:test";

import {
  isPublicPath,
  privacyNoticeKindFromPath,
  PUBLIC_PATHS,
} from "./public-routes";

test("public paths include privacy routes without auth", () => {
  assert.ok(PUBLIC_PATHS.includes("/login"));
  assert.ok(PUBLIC_PATHS.includes("/privacidad"));
  assert.ok(PUBLIC_PATHS.includes("/privacidad/simplificado"));
  assert.equal(isPublicPath("/privacidad/"), true);
  assert.equal(isPublicPath("/admin"), false);
});

test("privacy notice kind resolves from pathname", () => {
  assert.equal(privacyNoticeKindFromPath("/privacidad"), "integral");
  assert.equal(
    privacyNoticeKindFromPath("/privacidad/simplificado"),
    "simplificado",
  );
  assert.equal(privacyNoticeKindFromPath("/eventos"), null);
});
