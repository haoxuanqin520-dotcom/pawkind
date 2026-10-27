import { Camera, PawPrint } from "lucide-react";
import { useId, useMemo } from "react";

import westiePortrait from "@/assets/westie-portrait.jpg";
import {
  BREEDS,
  SWITCH_SCHEDULE,
  buildPlan,
  findBreed,
  machineReadableZone,
  possessive,
  type Activity,
  type DogProfile,
  type PassportPlan,
} from "./passport";

const ACTIVITIES: { value: Activity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

const STAMP_TEXT: Record<PassportPlan["status"], string> = {
  fit: "Trial fit",
  vet: "Vet check first",
  "not-suitable": "Adult dogs only",
  incomplete: "Details needed",
};

type Props = {
  profile: DogProfile;
  onChange: (profile: DogProfile) => void;
  onApply: () => void;
};

export function DogPassport({ profile, onChange, onApply }: Props) {
  const plan = useMemo(() => buildPlan(profile), [profile]);
  const breed = findBreed(profile.breed);
  const [mrz1, mrz2] = machineReadableZone(profile, plan);
  const displayName = profile.name.trim() || "Your dog";
  const id = useId();
  const set = <K extends keyof DogProfile>(key: K, value: DogProfile[K]) =>
    onChange({ ...profile, [key]: value });

  return (
    <section id="passport" className="passport-section" aria-labelledby="passport-title">
      <div className="wrap">
        <div className="passport-head">
          <h2 id="passport-title">Meet your dog first.</h2>
          <p>
            Tell us a little about them. We'll check whether the trial suits them and give a rough
            idea of how much they'd eat. Nothing you type here leaves this page.
          </p>
        </div>

        <div className="passport-grid">
          <form
            className="passport-form"
            onSubmit={(event) => event.preventDefault()}
            aria-label="Your dog's details"
          >
            <label className="field">
              <span>Name</span>
              <input
                value={profile.name}
                maxLength={24}
                autoComplete="off"
                onChange={(event) => set("name", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Breed</span>
              <select value={profile.breed} onChange={(event) => set("breed", event.target.value)}>
                {BREEDS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-pair">
              <label className="field">
                <span>Age in years</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="25"
                  step="0.5"
                  value={profile.age}
                  onChange={(event) => set("age", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Weight in kg</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="90"
                  step="0.1"
                  value={profile.weight}
                  aria-describedby={breed?.typicalKg ? `${id}-weight-hint` : undefined}
                  onChange={(event) => set("weight", event.target.value)}
                />
              </label>
            </div>
            {breed?.typicalKg && (
              <p className="field-hint" id={`${id}-weight-hint`}>
                A typical adult {breed.label} weighs {breed.typicalKg[0]} to {breed.typicalKg[1]}{" "}
                kg.
              </p>
            )}

            <fieldset className="field">
              <legend>Activity</legend>
              <div className="segmented">
                {ACTIVITIES.map((item) => (
                  <label key={item.value}>
                    <input
                      type="radio"
                      name={`${id}-activity`}
                      value={item.value}
                      checked={profile.activity === item.value}
                      onChange={() => set("activity", item.value)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>Anything we should know?</legend>
              <div className="checks">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={profile.pregnant}
                    onChange={(event) => set("pregnant", event.target.checked)}
                  />
                  <span>Pregnant or nursing</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={profile.vetDiet}
                    onChange={(event) => set("vetDiet", event.target.checked)}
                  />
                  <span>On a vet-prescribed diet</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={profile.sensitive}
                    onChange={(event) => set("sensitive", event.target.checked)}
                  />
                  <span>Food allergies or a sensitive stomach</span>
                </label>
              </div>
            </fieldset>
          </form>

          <div className="passport-output">
            <article
              className="passport-card"
              aria-label={`${possessive(displayName)} PawKind passport`}
            >
              <header className="passport-card-head">
                <span className="passport-brand">PawKind</span>
                <span>Dog passport</span>
              </header>
              <div className="passport-body">
                <div className="passport-photo-wrap">
                  <div className="passport-photo">
                    {breed?.value === "westie" ? (
                      <img src={westiePortrait} alt="" width={380} height={380} />
                    ) : (
                      <PawPrint aria-hidden="true" />
                    )}
                  </div>
                  <div
                    key={plan.status}
                    className={`passport-stamp stamp-${plan.status}`}
                    aria-hidden="true"
                  >
                    {STAMP_TEXT[plan.status]}
                  </div>
                </div>
                <dl className="passport-fields">
                  <div className="span-2">
                    <dt>Name</dt>
                    <dd>{displayName}</dd>
                  </div>
                  <div className="span-2">
                    <dt>Breed</dt>
                    <dd>{breed?.label ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Age</dt>
                    <dd>{profile.age.trim() ? `${profile.age} yrs` : "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Weight</dt>
                    <dd>{plan.kg !== null ? `${plan.kg} kg` : "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Life stage</dt>
                    <dd>{plan.lifeStage ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{plan.size ?? "Not set"}</dd>
                  </div>
                </dl>
              </div>
              <div className="passport-mrz" aria-hidden="true">
                <span>{mrz1}</span>
                <span>{mrz2}</span>
              </div>
            </article>

            <a
              className="passport-wall-link"
              href={`/wall?name=${encodeURIComponent(profile.name.trim())}&breed=${encodeURIComponent(profile.breed)}`}
            >
              <Camera aria-hidden="true" />
              Share a real photo of {profile.name.trim() || "your dog"} on the dog wall
            </a>

            <PlanCard plan={plan} name={displayName} onApply={onApply} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  name,
  onApply,
}: {
  plan: PassportPlan;
  name: string;
  onApply: () => void;
}) {
  const owner = possessive(name);

  if (
    plan.status === "fit" &&
    plan.gramsRange &&
    plan.kcalRange &&
    plan.switchDaysCovered !== null
  ) {
    const covered = plan.switchDaysCovered;
    return (
      <div className="plan-card" aria-live="polite">
        <h3>{owner} plan</h3>
        <p className="plan-range">
          <strong>
            {plan.gramsRange[0]}–{plan.gramsRange[1]} g
          </strong>{" "}
          a day, split into two meals
        </p>
        <p className="plan-note">
          This is a rough range for a typical dry food, about {plan.kcalRange[0]}–
          {plan.kcalRange[1]} kcal. PawKind's own feeding guide will follow its lab analysis, so
          treat this as a starting point, not a prescription.
        </p>
        <div
          className="switch-meter"
          role="img"
          aria-label={`The 300 gram trial covers ${covered === 7 ? "all 7 days" : `the first ${covered} days`} of the 7-day switch.`}
        >
          {SWITCH_SCHEDULE.map((share, index) => (
            <span key={index} className={index < covered ? "covered" : ""}>
              <i style={{ height: `${share * 100}%` }} />
              <small>{index + 1}</small>
            </span>
          ))}
        </div>
        <p className="plan-coverage">
          {covered === 7
            ? "The 300 g trial pack covers the whole 7-day switch."
            : `The 300 g trial pack covers the first ${covered} days of the 7-day switch. That's enough to see whether ${name.trim() || "your dog"} likes it.`}
        </p>
        <button type="button" className="btn btn-primary" onClick={onApply}>
          Apply for {owner} trial
        </button>
      </div>
    );
  }

  const titles: Record<Exclude<PassportPlan["status"], "fit">, string> = {
    vet: "Check with your vet first",
    "not-suitable": "Not the right recipe yet",
    incomplete: "A couple of details to go",
  };
  const status = plan.status === "fit" ? "incomplete" : plan.status;

  return (
    <div className={`plan-card plan-${status}`} aria-live="polite">
      <h3>{titles[status]}</h3>
      <ul className="plan-reasons">
        {plan.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {status === "vet" && (
        <>
          <p className="plan-note">
            We won't suggest a portion here. Your vet can tell you whether PawKind suits{" "}
            {name.trim() || "your dog"} and how much to feed.
          </p>
          <button type="button" className="btn btn-outline" onClick={onApply}>
            Apply for the trial
          </button>
        </>
      )}
      {status === "not-suitable" && (
        <p className="plan-note">
          PawKind is made for healthy adult dogs. If any detail above is wrong, change it and the
          plan will update.
        </p>
      )}
    </div>
  );
}
