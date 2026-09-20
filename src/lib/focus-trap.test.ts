import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldWrapTabFocus, type FocusTrapBoundary } from "./focus-trap";

describe("shouldWrapTabFocus", () => {
  const boundary: FocusTrapBoundary = {
    first: { focus: () => {} } as HTMLElement,
    last: { focus: () => {} } as HTMLElement,
  };

  it("ignores non-Tab keys", () => {
    assert.equal(
      shouldWrapTabFocus(
        { key: "Escape", shiftKey: false },
        boundary.first,
        boundary,
      ),
      null,
    );
  });

  it("wraps forward from last focusable to first", () => {
    assert.equal(
      shouldWrapTabFocus(
        { key: "Tab", shiftKey: false },
        boundary.last,
        boundary,
      ),
      "first",
    );
  });

  it("wraps backward from first focusable to last", () => {
    assert.equal(
      shouldWrapTabFocus(
        { key: "Tab", shiftKey: true },
        boundary.first,
        boundary,
      ),
      "last",
    );
  });

  it("does not wrap in the middle of the trap", () => {
    const middle = {} as HTMLElement;
    assert.equal(
      shouldWrapTabFocus({ key: "Tab", shiftKey: false }, middle, boundary),
      null,
    );
  });
});
