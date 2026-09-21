import assert from "node:assert/strict";
import test from "node:test";

import {
  formatAdminEventCapacity,
  formatAdminEventSchedule,
} from "./admin-event-display";

test("admin event display helpers", async (t) => {
  await t.test("formats schedule range in es-MX", () => {
    const schedule = formatAdminEventSchedule(
      new Date("2026-06-15T18:30:00Z"),
      new Date("2026-06-15T21:00:00Z"),
    );
    assert.match(schedule, /–/);
    assert.match(schedule, /\d/);
  });

  await t.test("formats capacity", () => {
    assert.equal(formatAdminEventCapacity(null), "Sin cupo");
    assert.equal(formatAdminEventCapacity(120), "120 personas");
  });
});
