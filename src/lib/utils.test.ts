import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional class names and resolves Tailwind conflicts", () => {
    assert.equal(cn("px-2 text-sm", null, "px-4"), "text-sm px-4");
  });
});
