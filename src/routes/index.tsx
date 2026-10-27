import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import packBack from "@/assets/pack-back.webp";
import packFront from "@/assets/pack-front.webp";
import { DogPassport } from "@/components/pawkind/DogPassport";
import { NutritionExplorer } from "@/components/pawkind/NutritionExplorer";
import { PawKindFooter } from "@/components/pawkind/PawKindFooter";
import { ProductSection } from "@/components/pawkind/ProductSection";
import { SiteHeader } from "@/components/pawkind/SiteHeader";
import { TrialDialog } from "@/components/pawkind/TrialDialog";
import { TrustFaq } from "@/components/pawkind/TrustFaq";
import { WallTeaser } from "@/components/pawkind/WallTeaser";
import { DEFAULT_PROFILE, type DogProfile } from "@/components/pawkind/passport";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PawKind | Adult dog food with Black Soldier Fly protein" },
      {
        name: "description",
        content:
          "A complete dry food concept for healthy adult dogs, made with Black Soldier Fly protein. Build your dog's passport, see what's inside, and apply for a 300 g trial.",
      },
      { property: "og:title", content: "PawKind | Care in every bowl" },
      {
        property: "og:description",
        content:
          "Adult dog food with Black Soldier Fly protein. Nutrition first, and open about what's tested.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PawKindPage,
});

const PRIORITIES = [
  "Health and nutrition",
  "Taste and safety",
  "Trust and evidence",
  "Price and value",
  "Sustainability",
];

function PawKindPage() {
  const [trialOpen, setTrialOpen] = useState(false);
  const [profile, setProfile] = useState<DogProfile>(DEFAULT_PROFILE);
  const openTrial = () => setTrialOpen(true);
  const editPassport = () => {
    setTrialOpen(false);
    requestAnimationFrame(() =>
      document.getElementById("passport")?.scrollIntoView({ behavior: "smooth" }),
    );
  };

  return (
    <main className="page">
      <SiteHeader onApply={openTrial} />

      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <h1 id="hero-title">Care in every bowl.</h1>
            <p className="hero-lede">
              Complete dry food for adult dogs, made with Black Soldier Fly protein. Nutrition comes
              first, and we're open about what's been tested and what hasn't yet.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={openTrial}>
                Apply for the trial
              </button>
              <a className="btn btn-outline" href="#passport">
                Start your dog's passport
              </a>
            </div>
            <p className="hero-terms">S$9.90 for a 300 g trial pack. No payment when you apply.</p>
          </div>
          <div className="hero-visual">
            <img className="hero-bag-back" src={packBack} alt="" width={468} height={762} />
            <img
              className="hero-bag-front"
              src={packFront}
              alt="The PawKind bag: adult dog food with Black Soldier Fly protein, with a West Highland terrier and a bowl of kibble on the front."
              width={627}
              height={963}
              fetchPriority="high"
            />
          </div>
        </div>
        <svg
          className="hero-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 64 C 280 4, 520 4, 760 46 S 1220 118, 1440 52 L 1440 120 L 0 120 Z" />
        </svg>
      </section>

      <DogPassport profile={profile} onChange={setProfile} onApply={openTrial} />

      <ProductSection onApply={openTrial} />

      <NutritionExplorer onApply={openTrial} />

      <section id="research" className="research-section" aria-labelledby="research-title">
        <div className="wrap research-layout">
          <div className="research-copy">
            <h2 id="research-title">We expected sustainability to lead. Owners ranked it last.</h2>
            <p>
              In our interviews and survey, dog owners were open to insect protein, but only once
              the basics were clear: complete nutrition, a safe recipe, a dog that actually eats it,
              and evidence they can check. So this page starts with your dog, not the planet.
            </p>
            <dl className="research-stats">
              <div>
                <dt>83%</dt>
                <dd>were open to trying insect-based dog food</dd>
              </div>
              <div>
                <dt>100%</dt>
                <dd>said their dog's needs come first</dd>
              </div>
              <div>
                <dt>83%</dt>
                <dd>were open on price</dd>
              </div>
            </dl>
          </div>
          <div className="priority-card">
            <h3>What owners care about most</h3>
            <ol>
              {PRIORITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <WallTeaser />

      <TrustFaq />

      <section className="final-cta" aria-labelledby="final-title">
        <svg
          className="final-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 56 C 300 120, 640 110, 900 62 S 1290 0, 1440 40 L 1440 0 L 0 0 Z" />
        </svg>
        <div className="wrap final-inner">
          <h2 id="final-title">Start with 300 grams. See what your dog thinks.</h2>
          <button type="button" className="btn btn-primary" onClick={openTrial}>
            Apply for the trial
          </button>
        </div>
      </section>

      <PawKindFooter />

      <TrialDialog
        open={trialOpen}
        onOpenChange={setTrialOpen}
        profile={profile}
        onEditPassport={editPassport}
      />
    </main>
  );
}
