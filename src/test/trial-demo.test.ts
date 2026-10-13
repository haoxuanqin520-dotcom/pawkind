import { describe, expect, it } from "vitest";
import { assignTrial, parseTrial, recordTrial, trialMetrics } from "../components/pawkind/trial-demo";

describe("trial experiment demo", () => {
  it("assigns A and B at the 50 percent threshold", () => {
    expect(assignTrial(0).variant).toBe("A");
    expect(assignTrial(0.499).variant).toBe("A");
    expect(assignTrial(0.5).variant).toBe("B");
    expect(assignTrial(0.99).variant).toBe("B");
  });
  it("restores assignment without switching or losing funnel state", () => {
    const session = recordTrial(assignTrial(0.8), "complete");
    expect(parseTrial(JSON.stringify(session))).toEqual(session);
    expect(recordTrial(session, "click")).toEqual(session);
    expect(recordTrial(session, "complete")).toEqual(session);
  });
  it("rejects corrupt or inconsistent browser data", () => {
    for (const raw of [null, "bad", "null", "{}", '{"variant":"C","clicked":false,"completed":false}', '{"variant":"A","clicked":false,"completed":true}']) expect(parseTrial(raw)).toBeNull();
  });
  it("uses visitors for both rate denominators, leaving empty rates undefined", () => {
    expect(trialMetrics(30, 12, 6)).toEqual(["30", "12", "6", "40%", "20%"]);
    expect(trialMetrics(30, 18, 12)).toEqual(["30", "18", "12", "60%", "40%"]);
    expect(trialMetrics(0, 0, 0)).toEqual(["0", "0", "0", "—", "—"]);
  });
});