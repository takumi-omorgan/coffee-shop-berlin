import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

describe("scaffold smoke", () => {
  it("exposes site constants", () => {
    expect(SITE.name).toBe("Berlin Coffee Directory");
    expect(SITE.description.length).toBeGreaterThan(10);
  });
});
