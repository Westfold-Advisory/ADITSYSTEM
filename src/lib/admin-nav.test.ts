import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ADMIN_NAV_LINKS, adminNavIsActive } from "@/lib/admin-nav";

describe("admin nav", () => {
  it("lists the three admin destinations", () => {
    assert.deepEqual(
      ADMIN_NAV_LINKS.map((link) => link.href),
      ["/admin", "/admin/mapa", "/admin/personas"],
    );
  });

  it("marks only the matching path as active", () => {
    assert.equal(adminNavIsActive("/admin/mapa", "/admin/mapa"), true);
    assert.equal(adminNavIsActive("/admin/mapa/", "/admin/mapa"), true);
    assert.equal(adminNavIsActive("/admin", "/admin/mapa"), false);
  });
});
