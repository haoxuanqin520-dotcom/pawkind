import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight, Leaf, Menu, QrCode, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import heroImage from "@/assets/pawkind-hero.jpg";
import { PawKindLogo } from "@/components/pawkind/PawKindLogo";
import { PetAppDemo } from "@/components/pawkind/PetAppDemo";
import { ProductCard } from "@/components/pawkind/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PawKind · Good for Pets. Kinder for the Planet." },
      { name: "description", content: "Complete dry food for dogs and cats made with Black Soldier Fly protein. Explore PawKind's 300 g trial pack and interactive nutrition prototype." },
      { property: "og:title", content: "PawKind · Good for Pets. Kinder for the Planet." },
      { property: "og:description", content: "A kinder kind of pet food, made with Black Soldier Fly protein and built around what pets need first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PawKindPage,
});

const processSteps = [
  ["01", "Food by-products", "Useful nutrients get a second life instead of becoming waste."],
  ["02", "Black Soldier Fly", "Larvae efficiently turn those nutrients into quality protein."],
  ["03", "Insect protein", "The larvae are dried and milled into a nutrient-rich meal."],
  ["04", "Complete kibble", "Balanced recipes are made for adult dogs and cats."],
  ["05", "Happier bowls", "Familiar food for them, with a lighter footprint for us."],
];

const questions = [
  ["Is it good for my pet?", "Pet Passport + Nutrition Plan", "A profile built around species, age, weight, activity and sensitivities helps create a safer starting point."],
  ["Will my pet eat it?", "Trial Pack + 7-day switch", "Start with 300 g rather than a large bag, then introduce PawKind gently over seven days."],
  ["Can I trust the claims?", "Trace", "A unique bag code connects the insect supplier lot, manufacturing batch and sample lab checks."],
  ["Why should I switch?", "Pawprint · planned", "Pet needs come first. Once the food works for them, Pawprint will make the avoided footprint visible."],
];

function PawKindPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="site-header">
        <a href="#top" aria-label="PawKind home"><PawKindLogo /></a>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Main navigation">
          <a href="#how">How it works</a><a href="#research">Research</a><a href="#app">The app</a><a href="#packs">Packs</a>
        </nav>
        <a href="#packs" className="header-cta hidden sm:inline-flex">Try it · S$9.90</a>
        <button className="icon-button md:hidden" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation"><a href="#how" onClick={closeMenu}>How it works</a><a href="#research" onClick={closeMenu}>Research</a><a href="#app" onClick={closeMenu}>The app</a><a href="#packs" onClick={closeMenu}>Packs</a></nav>}
      </header>

      <section id="top" className="hero-section">
        <img src={heroImage} alt="A West Highland terrier and grey cat beside a PawKind food pouch" width={1400} height={1200} className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="script-note">Made for curious pets in Singapore</p>
          <h1>Good for pets.<br /><span>Kinder</span> for the planet.</h1>
          <p className="hero-copy">Complete dry food for dogs and cats, made with Black Soldier Fly protein. Real nutrition first, with a lighter footprint built in.</p>
          <div className="flex flex-wrap gap-3">
            <a className="primary-cta" href="#packs">Try 300 g · S$9.90 <ArrowRight className="size-4" /></a>
            <a className="secondary-cta" href="#app">Explore the app</a>
          </div>
          <div className="hero-proof"><span><CheckCircle2 /> Adult dog & cat recipes</span><span><QrCode /> Traceable bag concept</span><span><Leaf /> Planned 15–20% BSF protein</span></div>
        </div>
      </section>

      <section id="how" className="content-section">
        <div className="section-heading"><p className="script-note">Why insects?</p><h2>A smaller protein with a surprisingly big job.</h2><p>Most bowls still rely on resource-intensive conventional proteins. Black Soldier Fly larvae offer a circular alternative—turning food by-products into useful nutrition.</p></div>
        <div className="process-grid">
          {processSteps.map(([number, title, detail], index) => <article className="process-step" key={number}><span>{number}</span><div className="process-icon">{index === 4 ? <CheckCircle2 /> : index === 1 ? <Leaf /> : <ChevronRight />}</div><h3>{title}</h3><p>{detail}</p></article>)}
        </div>
      </section>

      <section id="research" className="research-band">
        <div className="content-section py-0">
          <div className="research-intro"><p className="eyebrow">What our research found</p><h2>We expected sustainability to lead. Pet owners ranked it last.</h2><p className="script-note">Curiosity is real, but adoption is conditional.</p></div>
          <div className="research-layout">
            <div className="priority-list"><p className="eyebrow">What owners told us</p>{["Health & nutrition", "Palatability & safety", "Trust & evidence", "Price & value", "Sustainability"].map((item, index) => <div className={index === 4 ? "last" : ""} key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div>
            <div className="research-copy"><h3>Pet needs come first. Always.</h3><p>Owners were open to a new protein, but only after the fundamentals were clear: complete nutrition, safe formulation, a pet that actually eats it, and evidence they can trust.</p><div className="stat-grid"><div><strong>83%</strong><span>open to trying insect-based pet food</span></div><div><strong>100%</strong><span>said their pet's needs come first</span></div><div><strong>83%</strong><span>showed openness on price</span></div></div></div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><p className="script-note">What every owner asked us</p><h2>Four questions stand between curiosity and the first bowl.</h2></div>
        <div className="question-grid">{questions.map(([title, feature, detail], index) => <article key={title}><div className="question-number">0{index + 1}</div><span>{feature}</span><h3>“{title}”</h3><p>{detail}</p></article>)}</div>
      </section>

      <section id="app" className="app-band">
        <div className="app-layout">
          <div className="app-copy"><p className="script-note">Try the prototype</p><h2>Your pet gets a passport. Every bag gets one too.</h2><p>Change Mochi's details and the portion, switch plan and trial-pack coverage update instantly. Then open Trace to follow a sample bag back through its supply chain.</p><div className="feature-list"><div><ShieldCheck /><span><strong>Pet-first guidance</strong>Safety checks flag pets who need a vet's advice.</span></div><div><QrCode /><span><strong>Traceable by design</strong>Sample supplier, batch and lab records in one place.</span></div><div><Leaf /><span><strong>Impact made visible</strong>Planned tools connect each bowl to its footprint.</span></div></div><p className="demo-note">Concept prototype · no account, order or payment is created.</p></div>
          <div className="flex justify-center"><PetAppDemo /></div>
        </div>
      </section>

      <section id="packs" className="content-section packs-section">
        <div className="section-heading"><p className="script-note">Start small</p><h2>Let them taste it before you commit.</h2><p>Separate adult dog and cat recipes. Start with the 300 g trial, then size up when your pet is ready.</p></div>
        <div className="product-grid">
          <ProductCard name="Trial Pack" weight="300 g" price="S$9.90" unitPrice="S$33.00 / kg" description="Enough to begin the 7-day switch." tone="pink" badge="Start here" featured />
          <ProductCard name="Standard" weight="1.5 kg" price="S$34.90" unitPrice="S$23.27 / kg" description="About 10 days for an 8 kg adult dog." tone="green" />
          <ProductCard name="Family" weight="5 kg" price="S$99.90" unitPrice="S$19.98 / kg" description="About 34 days for an 8 kg adult dog." tone="gold" badge="Best value" />
        </div>
        <p className="demo-note mx-auto mt-6 text-center">Product buttons are part of this concept demo. No order or payment is created.</p>
      </section>

      <section className="impact-band"><div><span>12</span><p><strong>Responsible production</strong>Food by-products become useful protein.</p></div><div><span>13</span><p><strong>Climate action</strong>Less reliance on livestock protein.</p></div><div><span>09</span><p><strong>Industry innovation</strong>A traceable farm-to-bag chain.</p></div></section>

      <section className="final-cta"><p className="script-note">A kinder first bowl</p><h2>Start with 300 grams.<br />See what your pet thinks.</h2><a className="light-cta" href="#packs">Explore the Trial Pack <ArrowRight className="size-4" /></a></section>

      <footer><PawKindLogo compact /><p>Good for Pets. Kinder for the Planet.</p><span>Singapore · Concept prototype</span></footer>
    </main>
  );
}
