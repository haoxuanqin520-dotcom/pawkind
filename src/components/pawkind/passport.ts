// Dog Passport logic. Pure functions, no React, so the rules are easy to test and review.
//
// Honesty rules (from the team's MVP review):
// - The PawKind recipe has not finished nutritional validation, so we never show one precise
//   portion. We show an indicative range built from general adult-dog energy guidelines and a
//   typical dry-food energy density, and we say so.
// - Dogs the adult recipe is not meant for (puppies, pregnant or nursing dogs) get no portion.
// - Dogs who need individual advice (vet diets, allergies or sensitive stomachs, seniors) are
//   sent to their vet first, also without a portion.

export type Activity = "low" | "normal" | "high";

export type DogProfile = {
  name: string;
  breed: string;
  age: string;
  weight: string;
  activity: Activity;
  pregnant: boolean;
  vetDiet: boolean;
  sensitive: boolean;
};

export type Breed = { value: string; label: string; typicalKg?: [number, number] };

// Common breeds in Singapore homes, with typical healthy adult weight ranges (kg).
export const BREEDS: Breed[] = [
  { value: "westie", label: "West Highland White Terrier", typicalKg: [6, 10] },
  { value: "beagle", label: "Beagle", typicalKg: [9, 11] },
  { value: "chihuahua", label: "Chihuahua", typicalKg: [1.5, 3] },
  { value: "corgi", label: "Corgi", typicalKg: [10, 14] },
  { value: "french-bulldog", label: "French Bulldog", typicalKg: [8, 13] },
  { value: "golden-retriever", label: "Golden Retriever", typicalKg: [25, 34] },
  { value: "labrador", label: "Labrador Retriever", typicalKg: [25, 36] },
  { value: "maltese", label: "Maltese", typicalKg: [2, 4] },
  { value: "schnauzer", label: "Miniature Schnauzer", typicalKg: [5, 8] },
  { value: "pomeranian", label: "Pomeranian", typicalKg: [2, 3.5] },
  { value: "poodle", label: "Poodle (toy or miniature)", typicalKg: [2, 8] },
  { value: "shiba", label: "Shiba Inu", typicalKg: [8, 11] },
  { value: "shih-tzu", label: "Shih Tzu", typicalKg: [4, 7] },
  { value: "singapore-special", label: "Singapore Special", typicalKg: [12, 20] },
  { value: "other", label: "Mixed breed or other" },
];

export const DEFAULT_PROFILE: DogProfile = {
  name: "Mochi",
  breed: "westie",
  age: "4",
  weight: "8",
  activity: "normal",
  pregnant: false,
  vetDiet: false,
  sensitive: false,
};

export const TRIAL_PACK_GRAMS = 300;
// Share of PawKind in the bowl on each day of the 7-day switch.
export const SWITCH_SCHEDULE = [0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1] as const;

// Typical adult maintenance multipliers on resting energy (RER = 70 × kg^0.75).
const ACTIVITY_FACTORS: Record<Activity, [number, number]> = {
  low: [1.2, 1.4],
  normal: [1.4, 1.8],
  high: [1.8, 2.4],
};
// Typical dry-food energy density (kcal per gram). PawKind's own value is pending lab analysis.
const ENERGY_DENSITY: [number, number] = [3.5, 4.0];

export type Status = "fit" | "vet" | "not-suitable" | "incomplete";
export type LifeStage = "Puppy" | "Adult" | "Senior";
export type SizeClass = "Toy" | "Small" | "Medium" | "Large" | "Giant";

export type PassportPlan = {
  status: Status;
  reasons: string[];
  lifeStage: LifeStage | null;
  size: SizeClass | null;
  kg: number | null;
  gramsRange: [number, number] | null;
  kcalRange: [number, number] | null;
  switchDaysCovered: number | null;
};

// "Mochi" -> "Mochi's", "Boris" -> "Boris'", empty -> "Your dog's".
export function possessive(name: string) {
  const clean = name.trim();
  if (!clean) return "Your dog's";
  return clean.endsWith("s") ? `${clean}'` : `${clean}'s`;
}

export function findBreed(value: string): Breed | undefined {
  return BREEDS.find((breed) => breed.value === value);
}

function parsePositive(value: string): number | null {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseAge(value: string): number | null {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function lifeStageFor(age: number): LifeStage {
  if (age < 1) return "Puppy";
  if (age > 7) return "Senior";
  return "Adult";
}

export function sizeFor(kg: number): SizeClass {
  if (kg < 5) return "Toy";
  if (kg < 10) return "Small";
  if (kg < 25) return "Medium";
  if (kg <= 45) return "Large";
  return "Giant";
}

const roundTo5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

export function dailyRange(
  kg: number,
  activity: Activity,
): { grams: [number, number]; kcal: [number, number] } {
  const rer = 70 * Math.pow(kg, 0.75);
  const [lo, hi] = ACTIVITY_FACTORS[activity];
  const kcal: [number, number] = [
    Math.round((rer * lo) / 10) * 10,
    Math.round((rer * hi) / 10) * 10,
  ];
  const grams: [number, number] = [
    roundTo5((rer * lo) / ENERGY_DENSITY[1]),
    roundTo5((rer * hi) / ENERGY_DENSITY[0]),
  ];
  return { grams, kcal };
}

// How many days of the 7-day switch the 300 g trial pack covers at a given daily amount.
export function switchDaysCovered(dailyGrams: number, packGrams = TRIAL_PACK_GRAMS): number {
  let used = 0;
  let days = 0;
  for (const share of SWITCH_SCHEDULE) {
    used += dailyGrams * share;
    if (used > packGrams) break;
    days += 1;
  }
  return days;
}

export function buildPlan(profile: DogProfile): PassportPlan {
  const age = parseAge(profile.age);
  const weight = parsePositive(profile.weight);
  const kg = weight === null ? null : Math.min(weight, 90);
  const lifeStage = age === null ? null : lifeStageFor(age);
  const size = kg === null ? null : sizeFor(kg);
  const empty = { gramsRange: null, kcalRange: null, switchDaysCovered: null };

  if (age === null || kg === null) {
    return {
      status: "incomplete",
      reasons: ["Add your dog's age and weight to see their plan."],
      lifeStage,
      size,
      kg,
      ...empty,
    };
  }

  const notSuitable: string[] = [];
  if (lifeStage === "Puppy")
    notSuitable.push("Puppies need a growth recipe. PawKind is made for adult dogs.");
  if (profile.pregnant)
    notSuitable.push("Pregnant and nursing dogs need a recipe made for that stage.");
  if (notSuitable.length)
    return { status: "not-suitable", reasons: notSuitable, lifeStage, size, kg, ...empty };

  const vet: string[] = [];
  if (profile.vetDiet)
    vet.push("Your dog is on a vet-prescribed diet. Please ask your vet before changing food.");
  if (profile.sensitive)
    vet.push(
      "Food allergies and sensitive stomachs need individual advice. Insect protein can cross-react with shellfish and dust-mite allergies.",
    );
  if (lifeStage === "Senior")
    vet.push("Dogs over 7 can have changing needs. A quick vet check is a good first step.");
  if (vet.length) return { status: "vet", reasons: vet, lifeStage, size, kg, ...empty };

  const { grams, kcal } = dailyRange(kg, profile.activity);
  const mid = (grams[0] + grams[1]) / 2;
  return {
    status: "fit",
    reasons: ["A healthy adult dog: a good match for the 300 g trial."],
    lifeStage,
    size,
    kg,
    gramsRange: grams,
    kcalRange: kcal,
    switchDaysCovered: switchDaysCovered(mid),
  };
}

// Decorative machine-readable zone for the passport card: two 44-character lines.
export function machineReadableZone(profile: DogProfile, plan: PassportPlan): [string, string] {
  const clean = (value: string) =>
    value
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "<")
      .replace(/^<+|<+$/g, "");
  const name = clean(profile.name) || "YOUR<DOG";
  const breed = clean(findBreed(profile.breed)?.label ?? "DOG");
  const pad = (value: string) => (value + "<".repeat(44)).slice(0, 44);
  const statusCode = {
    fit: "TRIAL",
    vet: "VETCHK",
    "not-suitable": "ADULTONLY",
    incomplete: "PENDING",
  }[plan.status];
  const age = parseAge(profile.age);
  const ageCode = age === null ? "<<" : String(Math.min(Math.round(age), 99)).padStart(2, "0");
  const kgCode = plan.kg === null ? "<<<" : String(Math.round(plan.kg * 10)).padStart(3, "0");
  return [pad(`P<SGP${name}<<${breed}`), pad(`PK300G${ageCode}Y${kgCode}KG<${statusCode}`)];
}
