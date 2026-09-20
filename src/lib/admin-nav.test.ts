import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_NAV_LINKS,
  adminNavIsActive,
  adminPageTitle,
} from "@/lib/admin-nav";

describe("admin nav", () => {
  it("lists the three admin destinations", () => {
    assert.deepEqual(
      ADMIN_NAV_LINKS.map((link) => link.href),
      ["/admin", "/admin/personas", "/admin/mapa"],
    );
  });

  it("marks only the matching path as active", () => {
    assert.equal(adminNavIsActive("/admin/mapa", "/admin/mapa"), true);
    assert.equal(adminNavIsActive("/admin/mapa/", "/admin/mapa"), true);
    assert.equal(adminNavIsActive("/admin", "/admin/mapa"), false);
  });

  it("uses the same page title as the nav label per route", () => {
    assert.equal(adminPageTitle("/admin"), "Eventos");
    assert.equal(adminPageTitle("/admin/mapa"), "Mapa de cobertura");
    for (const link of ADMIN_NAV_LINKS) {
      assert.equal(link.pageTitle, link.label);
    }
  });
});
