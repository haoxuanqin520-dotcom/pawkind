import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROFILE,
  buildPlan,
  dailyRange,
  machineReadableZone,
  switchDaysCovered,
} from "../components/pawkind/passport";

describe("Dog Passport plan", () => {
  it("gives a healthy adult dog a portion range, never a single number", () => {
    const plan = buildPlan(DEFAULT_PROFILE);
    expect(plan.status).toBe("fit");
    expect(plan.gramsRange).not.toBeNull();
    const [low, high] = plan.gramsRange!;
    expect(high).toBeGreaterThan(low);
  });

  it("does not give puppies or pregnant dogs a portion", () => {
    for (const profile of [
      { ...DEFAULT_PROFILE, age: "0.5" },
      { ...DEFAULT_PROFILE, pregnant: true },
    ]) {
      const plan = buildPlan(profile);
      expect(plan.status).toBe("not-suitable");
      expect(plan.gramsRange).toBeNull();
    }
  });

  it("sends vet diets, sensitive dogs and seniors to the vet first", () => {
    for (const profile of [
      { ...DEFAULT_PROFILE, vetDiet: true },
      { ...DEFAULT_PROFILE, sensitive: true },
      { ...DEFAULT_PROFILE, age: "9" },
    ]) {
      const plan = buildPlan(profile);
      expect(plan.status).toBe("vet");
      expect(plan.gramsRange).toBeNull();
    }
  });

  it("asks for age and weight before planning", () => {
    expect(buildPlan({ ...DEFAULT_PROFILE, weight: "" }).status).toBe("incomplete");
    expect(buildPlan({ ...DEFAULT_PROFILE, age: "abc" }).status).toBe("incomplete");
  });

  it("scales the range with activity", () => {
    const low = dailyRange(8, "low").grams;
    const high = dailyRange(8, "high").grams;
    expect(high[1]).toBeGreaterThan(low[1]);
  });

  it("counts how much of the 7-day switch the 300 g pack covers", () => {
    expect(switchDaysCovered(60)).toBe(7); // needs 240 g in total
    expect(switchDaysCovered(150)).toBe(4); // 37.5 + 37.5 + 75 + 75 = 225, day 5 would reach 337.5
  });

  it("builds two 44-character machine-readable lines", () => {
    const [line1, line2] = machineReadableZone(DEFAULT_PROFILE, buildPlan(DEFAULT_PROFILE));
    expect(line1).toHaveLength(44);
    expect(line2).toHaveLength(44);
    expect(line1.startsWith("P<SGPMOCHI<<WEST<HIGHLAND")).toBe(true);
  });
});
