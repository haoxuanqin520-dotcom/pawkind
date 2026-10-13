export type TrialVariant = "A" | "B";
export type TrialSession = { variant: TrialVariant; clicked: boolean; completed: boolean };
export const TRIAL_STORAGE_KEY = "pawkind-ab-demo-v1";

export function assignTrial(random = Math.random()): TrialSession {
  return { variant: random < 0.5 ? "A" : "B", clicked: false, completed: false };
}

export function parseTrial(raw: string | null): TrialSession | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    if (!("variant" in value) || !("clicked" in value) || !("completed" in value)) return null;
    if ((value.variant !== "A" && value.variant !== "B") || typeof value.clicked !== "boolean" || typeof value.completed !== "boolean") return null;
    if (value.completed && !value.clicked) return null;
    return { variant: value.variant, clicked: value.clicked, completed: value.completed };
  } catch { return null; }
}

export function recordTrial(session: TrialSession, event: "click" | "complete"): TrialSession {
  return { ...session, clicked: true, completed: session.completed || event === "complete" };
}

export function trialMetrics(visitors: number, clicks: number, applications: number) {
  return [String(visitors), String(clicks), String(applications), visitors ? `${Math.round(clicks / visitors * 100)}%` : "—", visitors ? `${Math.round(applications / visitors * 100)}%` : "—"];
}