import { Bug, Droplets, Pill, Wheat, type LucideIcon } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";

type Stage = "planned" | "in-progress" | "not-started";

type Nutrient = {
  id: string;
  name: string;
  tab: string;
  icon: LucideIcon;
  source: string;
  general: string;
  pawkind: string;
  stage: Stage;
  stageText: string;
};

const STAGE_LABEL: Record<Stage, string> = {
  planned: "Planned",
  "in-progress": "In formulation",
  "not-started": "Not tested yet",
};

const NUTRIENTS: Nutrient[] = [
  {
    id: "bsf",
    name: "Black Soldier Fly protein",
    tab: "BSF protein",
    icon: Bug,
    source:
      "Black Soldier Fly larvae raised on pre-consumer food by-products, then dried and milled into a protein meal.",
    general:
      "Insect meal is a dense protein source, typically around 40–60% crude protein, and it supplies all ten amino acids dogs must get from their food. It is already used in commercial dog foods in Europe.",
    pawkind: "Planned as 15–20% of the recipe and its main animal protein.",
    stage: "planned",
    stageText: "Amino acid profile waiting on lab analysis.",
  },
  {
    id: "fibre",
    name: "Fibre",
    tab: "Fibre",
    icon: Wheat,
    source: "Candidate sources being compared: oats and pumpkin.",
    general:
      "Dietary fibre supports digestion and firm, regular stools. Too much can make other nutrients harder to absorb, so the amount matters as much as the source.",
    pawkind: "Source and level will be set during formulation.",
    stage: "in-progress",
    stageText: "Still choosing between candidate sources.",
  },
  {
    id: "fats",
    name: "Healthy fats",
    tab: "Fats",
    icon: Droplets,
    source:
      "Natural fat from the larvae, plus an omega-3 source (fish or algal oil) still under evaluation.",
    general:
      "Fat is the most concentrated source of energy in a dog's diet and carries fat-soluble vitamins. Omega-3 fatty acids help keep skin and coat healthy.",
    pawkind: "The omega-3 source and amount are not decided yet.",
    stage: "in-progress",
    stageText: "Omega-3 source under evaluation.",
  },
  {
    id: "micros",
    name: "Vitamins and minerals",
    tab: "Vitamins",
    icon: Pill,
    source: "A vitamin and mineral premix added to the recipe.",
    general:
      "A food can only be called complete and balanced when it meets the minimum levels in a recognised nutrient profile, such as FEDIAF's profile for adult dogs.",
    pawkind: "Target: meet the FEDIAF adult maintenance profile.",
    stage: "not-started",
    stageText: "Not yet tested against the profile.",
  },
];

const [FIRST_NUTRIENT] = NUTRIENTS as [Nutrient, ...Nutrient[]];

const ANALYSIS = ["Crude protein", "Crude fat", "Crude fibre", "Moisture"];

export function NutritionExplorer({ onApply }: { onApply: () => void }) {
  const [activeId, setActiveId] = useState(FIRST_NUTRIENT.id);
  const baseId = useId();
  const active = NUTRIENTS.find((item) => item.id === activeId) ?? FIRST_NUTRIENT;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = NUTRIENTS.findIndex((item) => item.id === activeId);
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index - 1
          : null;
    if (next === null) return;
    event.preventDefault();
    const target = NUTRIENTS[(next + NUTRIENTS.length) % NUTRIENTS.length];
    if (!target) return;
    setActiveId(target.id);
    document.getElementById(`${baseId}-tab-${target.id}`)?.focus();
  }

  return (
    <section id="inside" className="explorer-section" aria-labelledby="explorer-title">
      <div className="wrap">
        <div className="explorer-head">
          <h2 id="explorer-title">What's inside, and what we've checked.</h2>
          <p>
            Pick an ingredient. On the left is what's generally true of it. On the right is where
            PawKind's recipe stands. Nothing here is a verified PawKind result yet; we'll mark
            results as verified once lab analysis is done.
          </p>
        </div>

        <div
          className="explorer-tabs"
          role="tablist"
          aria-label="Ingredients"
          onKeyDown={onKeyDown}
        >
          {NUTRIENTS.map((item) => {
            const Icon = item.icon;
            const selected = item.id === activeId;
            return (
              <button
                key={item.id}
                id={`${baseId}-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(item.id)}
              >
                <Icon aria-hidden="true" />
                {item.tab}
              </button>
            );
          })}
        </div>

        <div
          className="explorer-panel"
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
        >
          <div className="explorer-intro">
            <h3>{active.name}</h3>
            <p>
              <span className="explorer-label">Where it comes from</span>
              {active.source}
            </p>
          </div>
          <div className="explorer-compare">
            <div className="explorer-general">
              <span className="explorer-label">In general</span>
              <p>{active.general}</p>
            </div>
            <div className="explorer-pawkind">
              <span className="explorer-label">In PawKind</span>
              <p>{active.pawkind}</p>
              <p className={`stage stage-${active.stage}`}>
                <b>{STAGE_LABEL[active.stage]}</b>
                {active.stageText}
              </p>
            </div>
          </div>
        </div>

        <div className="analysis">
          <div className="analysis-copy">
            <h3>Guaranteed analysis</h3>
            <p>
              These numbers go on every bag. We'll publish PawKind's once a lab has measured them,
              not before.
            </p>
          </div>
          <ul className="analysis-rows">
            {ANALYSIS.map((label) => (
              <li key={label}>
                <span>{label}</span>
                <i aria-hidden="true" />
                <em>Awaiting lab</em>
              </li>
            ))}
          </ul>
        </div>

        <div className="explorer-cta">
          <p>
            Ready to see what your dog thinks? The 300 g trial pack is S$9.90, and applying is free.
          </p>
          <button type="button" className="btn btn-light" onClick={onApply}>
            Apply for the trial
          </button>
        </div>
      </div>
    </section>
  );
}
