import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  CircleAlert,
  Heart,
  PawPrint,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Screen = "passport" | "plan" | "trace";
type ActivityLevel = "low" | "normal" | "high";

const traceSteps = [
  ["Supplier lot", "BSF-SG-0826", "Black Soldier Fly meal · Singapore"],
  ["Manufacturing batch", "PK-AD-2608", "Adult recipe · packed 26 Aug 2026"],
  ["Lab & QA", "Passed", "Protein, moisture and microbiology checked"],
  ["Your bag", "PK-2608-1842", "Trace record ready to share"],
];

export function PetAppDemo() {
  const [screen, setScreen] = useState<Screen>("passport");
  const [name, setName] = useState("Mochi");
  const [age, setAge] = useState("4");
  const [weight, setWeight] = useState("8");
  const [activity, setActivity] = useState<ActivityLevel>("normal");
  const [pregnant, setPregnant] = useState(false);
  const [vetDiet, setVetDiet] = useState(false);
  const [added, setAdded] = useState(false);

  const plan = useMemo(() => {
    const parsedWeight = Number.parseFloat(weight);
    const validWeight = Number.isFinite(parsedWeight) && parsedWeight > 0;
    const kg = validWeight ? Math.min(parsedWeight, 90) : 0;
    const factors = { low: 1.4, normal: 1.6, high: 2 };
    const kcal = validWeight ? Math.round(70 * Math.pow(kg, 0.75) * factors[activity]) : 0;
    const grams = validWeight ? Math.round(kcal / 3.6) : 0;
    return { kcal, grams, hold: pregnant || vetDiet || Number.parseFloat(age) < 1 };
  }, [activity, age, pregnant, vetDiet, weight]);

  const possessive = `${name.trim() || "Your dog"}${name.trim().endsWith("s") ? "'" : "'s"}`;

  return (
    <div className="pet-phone" aria-label="Interactive PawKind app prototype">
      <div className="pet-phone-screen">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold">
            <PawPrint className="size-5 text-primary" aria-hidden="true" /> Paw<span className="text-primary">Kind</span>
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">Prototype</span>
        </header>

        <div className="pet-app-scroll">
          {screen === "passport" && (
            <div className="space-y-5 p-5">
              <div>
                <p className="eyebrow">Pet passport</p>
                <h3 className="mt-1 font-display text-3xl font-extrabold">Tell us about your dog.</h3>
                <p className="mt-2 text-sm text-muted-foreground">A few details make every recommendation safer and more useful.</p>
              </div>

              <label className="app-field">
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="app-field">
                  <span>Age · years</span>
                  <input type="number" min="0" step="0.5" value={age} onChange={(event) => setAge(event.target.value)} />
                </label>
                <label className="app-field">
                  <span>Weight · kg</span>
                  <input type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} />
                </label>
              </div>

              <fieldset className="space-y-2">
                <legend className="app-label">Activity</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "normal", "high"] as ActivityLevel[]).map((item) => (
                    <button className="activity-button" key={item} type="button" aria-pressed={activity === item} onClick={() => setActivity(item)}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="check-row"><input type="checkbox" checked={pregnant} onChange={(event) => setPregnant(event.target.checked)} /> Pregnant or nursing</label>
              <label className="check-row"><input type="checkbox" checked={vetDiet} onChange={(event) => setVetDiet(event.target.checked)} /> On a vet-prescribed diet</label>

              <button className="app-primary" type="button" onClick={() => setScreen("plan")}>
                See {possessive} plan <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {screen === "plan" && (
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="eyebrow">Nutrition plan</p><h3 className="font-display text-2xl font-extrabold">{possessive} daily bowl</h3></div>
                <span className={`status-chip ${plan.hold ? "warning" : "ready"}`}>{plan.hold ? "Vet check" : "Ready"}</span>
              </div>
              <div className="portion-panel">
                <span className="text-xs font-bold uppercase">Daily portion</span>
                <div className="flex items-end gap-2"><strong>{plan.grams || "—"}</strong><span>g</span></div>
                <p>{plan.grams ? `About ${plan.kcal} kcal · 2 meals of ${Math.round(plan.grams / 2)} g` : "Add a valid weight"}</p>
              </div>
              {plan.hold && <div className="app-alert"><CircleAlert className="mt-0.5 size-5 shrink-0" /><p><strong>Check with your vet first.</strong><br />Growing, pregnant and prescription-diet pets need individual guidance.</p></div>}
              <div className="app-panel">
                <h4 className="font-display text-lg font-bold">7-day gentle switch</h4>
                {[25, 50, 75, 100].map((percent, index) => (
                  <div className="mt-3" key={percent}>
                    <div className="mb-1 flex justify-between text-xs font-semibold"><span>Day {index * 2 + 1}{index < 3 ? `–${index * 2 + 2}` : ""}</span><span>{percent}% PawKind</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="app-panel flex items-start gap-3"><ShieldCheck className="size-6 shrink-0 text-accent" /><p className="text-sm"><strong>Trial pack coverage</strong><br /><span className="text-muted-foreground">{plan.grams && plan.grams <= 95 ? "The 300 g pack covers the full switch." : "Start the switch, then continue with a 1.5 kg bag."}</span></p></div>
              <button className={`app-primary ${added ? "added" : ""}`} type="button" onClick={() => setAdded((value) => !value)}>{added ? <><Check className="size-4" /> Added · demo only</> : "Add Trial Pack · S$9.90"}</button>
            </div>
          )}

          {screen === "trace" && (
            <div className="space-y-5 p-5">
              <div><p className="eyebrow">Trace</p><h3 className="font-display text-3xl font-extrabold">One bag. The whole story.</h3><p className="mt-2 text-sm text-muted-foreground">Sample batch record for the PawKind concept.</p></div>
              <div className="trace-code"><QrCode className="size-20" /><div><p className="text-xs font-bold uppercase text-muted-foreground">Bag identity</p><strong className="font-mono text-lg">PK-2608-1842</strong><p className="text-sm">Adult dog recipe · 300 g</p></div></div>
              <ol className="space-y-0">
                {traceSteps.map(([title, code, detail], index) => (
                  <li className="trace-step" key={title}>
                    <span>{index + 1}</span>
                    <div><strong>{title}</strong><code>{code}</code><p>{detail}</p></div>
                  </li>
                ))}
              </ol>
              <div className="app-panel flex gap-3"><ShieldCheck className="size-6 shrink-0 text-accent" /><p className="text-sm"><strong>Checks passed</strong><br /><span className="text-muted-foreground">Sample data. Real bags would link to verified supplier and lab records.</span></p></div>
            </div>
          )}
        </div>

        <nav className="pet-app-nav" aria-label="App prototype sections">
          {([
            ["passport", UserRound, "Passport"],
            ["plan", Activity, "Plan"],
            ["trace", QrCode, "Trace"],
          ] as const).map(([value, Icon, label]) => (
            <button key={value} type="button" aria-current={screen === value ? "page" : undefined} onClick={() => setScreen(value)}>
              <Icon className="size-5" aria-hidden="true" />{label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}