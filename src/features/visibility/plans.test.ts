import { describe, expect, it } from "vitest";
import {
  VISIBILITY_PLANS,
  nextVisibilityRun,
  normalizeVisibilityPlanKey,
} from "./plans";

describe("visibility commercial plans", () => {
  it("keeps plan pricing and limits explicit", () => {
    expect(VISIBILITY_PLANS.monitor.priceSek).toBe(299);
    expect(VISIBILITY_PLANS.growth.trackedQueryLimit).toBe(100);
    expect(VISIBILITY_PLANS.agency.workspaceLimit).toBe(10);
  });

  it("normalizes unknown stored values to monitor", () => {
    expect(normalizeVisibilityPlanKey("growth")).toBe("growth");
    expect(normalizeVisibilityPlanKey("legacy")).toBe("monitor");
  });

  it("calculates the next review without mutating the input date", () => {
    const input = new Date("2026-09-30T10:00:00.000Z");
    expect(nextVisibilityRun("weekly", input).toISOString()).toBe("2026-10-07T10:00:00.000Z");
    expect(nextVisibilityRun("monthly", input).toISOString()).toBe("2026-10-30T10:00:00.000Z");
    expect(input.toISOString()).toBe("2026-09-30T10:00:00.000Z");
  });
});
