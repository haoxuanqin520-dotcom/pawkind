import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Leaf, ShieldCheck, QrCode, CalendarDays, Soup } from "lucide-react";
import productA from "@/assets/trial-a-product.jpg";
import productB from "@/assets/trial-b-dog-product.jpg";
import bowlA from "@/assets/trial-a-bowl.jpg";
import petsB from "@/assets/trial-b-dog.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PawKindLogo } from "./PawKindLogo";
import { PawKindFooter } from "./PawKindFooter";
import { CircularFoodLoop } from "./CircularFoodLoop";
import { SUPPORTED_RECIPES } from "./supported-recipes";
import { type TrialVariant, parseTrial, recordTrial, trialMetrics, TRIAL_STORAGE_KEY, type TrialSession } from "./trial-demo";

export function TrialExperiment({ onBack, variant, onVersion, onSection }: { onBack: () => void; variant: TrialVariant; onVersion: (variant: TrialVariant) => void; onSection: (section: string) => void }) {
  // This component mounts only after a browser interaction, never during SSR.
  const [session, setSession] = useState<TrialSession>(() => {
    const fresh: TrialSession = { variant, clicked: false, completed: false };
    try { const stored = parseTrial(localStorage.getItem(TRIAL_STORAGE_KEY)); return stored?.variant === variant ? stored : fresh; }
    catch { return fresh; }
  });
  const [saved, setSaved] = useState(() => {
    try {
      const existing = parseTrial(localStorage.getItem(TRIAL_STORAGE_KEY));
      if (existing?.variant !== variant) localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(session));
      return true;
    } catch { return false; }
  });
  const [formOpen, setFormOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    void supabase.rpc("record_trial_event", { _variant: session.variant, _event: "view" }).then();
    void supabase.from("trial_counters").select("clicks").eq("variant", session.variant).single()
      .then(({ data }) => { if (data) setLiveCount(data.clicks); });
  }, [session.variant]);

  function update(event: "click" | "complete") {
    const next = recordTrial(session, event);
    setSession(next);
    try { localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next)); }
    catch { setSaved(false); }
    void supabase.rpc("record_trial_event", { _variant: next.variant, _event: event === "click" ? "click" : "complete" }).then();
    if (event === "click") setLiveCount((n) => (n === null ? null : n + 1));
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update("complete");
  }

  const sustainability = session.variant === "A";
  return <main className={`trial-page ${sustainability ? "version-a" : "version-b"} min-h-screen bg-background text-foreground`}>
    <header className="site-header"><PawKindLogo /><Button variant="ghost" onClick={onBack}><ArrowLeft /> Back to PawKind</Button></header>
    <section className="trial-product-hero" aria-labelledby="trial-product-title" data-variant={session.variant}>
      <div className="trial-product-visual"><img src={sustainability ? productA : productB} alt={sustainability ? "PawKind 300 g trial pouch on green leaves and vegetable peels with kibble in front" : "PawKind 300 g trial pouch with kibble, a concept ingredient label and demo trace code"} width={1024} height={1024} fetchPriority="high" /></div>
      <div className="trial-product-copy"><p className="version-category">VERSION {session.variant} · {sustainability ? "Sustainability" : "Nutrition & Trust"}</p><h1 id="trial-product-title">PawKind</h1><p className="trial-product-description">Complete dry food for adult dogs, made with Black Soldier Fly protein</p><p className="trial-product-price">S$9.90 <span>· 300 g trial pack</span></p><Button className="trial-primary" onClick={() => { update("click"); setFormOpen(true); }}>Try the 300 g Trial Pack <ArrowRight /></Button><div className="trial-key-facts"><span><Soup />Adult recipes</span><span><CalendarDays />7-day switch</span><span><QrCode />Sample traceability</span></div></div>
    </section>
    <section className="trial-story" aria-labelledby="trial-title">
      <div className="trial-story-copy">
        <p className="script-note">{sustainability ? "A circular approach" : "Pet needs come first"}</p>
        <h2 id="trial-title">{sustainability ? <>A kinder bowl.<br />A lighter footprint.</> : <>Nutrition first.<br />Trust in every bowl.</>}</h2>
        <p className="trial-message">{sustainability ? "Explore a circular protein: Black Soldier Fly larvae turn food by-products into useful nutrition, reducing reliance on conventional livestock protein." : "Explore adult dog recipes with Black Soldier Fly protein, a careful 7-day transition and sample ingredient-to-bag traceability."}</p>
        <div className="trial-benefit">{sustainability ? <Leaf /> : <ShieldCheck />}<span>{sustainability ? "Food by-products. Useful protein. A circular approach." : "Ingredient transparency. Careful transition. Pet-first guidance."}</span></div>
        <Button size="lg" className="trial-primary" onClick={() => { update("click"); setFormOpen(true); }}>Apply for Trial Pack <ArrowRight /></Button>
        {liveCount !== null && <p className="text-sm text-muted-foreground" aria-live="polite">{liveCount} {liveCount === 1 ? "person has" : "people have"} clicked this button so far.</p>}
        {!saved && <p role="status" className="text-sm text-muted-foreground">Browser storage is unavailable. This demo lasts until you leave this screen.</p>}
      </div>
      {sustainability ? <CircularFoodLoop /> : <figure className="trial-story-figure"><img src={productB} alt="Kibble beside a concept ingredient label; pouch with a demo QR trace code and lab-checked concept badge" width={1024} height={1024} loading="lazy" /><figcaption>Sample packaging, ingredient label and lab-check badge · illustrative, not certification.</figcaption></figure>}
    </section>
    <section className="trial-lifestyle"><img src={sustainability ? bowlA : petsB} alt={sustainability ? "Bowl of kibble on a wooden table beside a green sprout" : "Adult dog eating kibble from a ceramic bowl"} width={1536} height={1024} loading="lazy" /><div><p className="script-note">{sustainability ? "Useful nutrition. A lighter footprint." : "A gentle start, for your dog."}</p><h2>{sustainability ? "A small change in the bowl." : "Trust starts with their bowl."}</h2><p>{sustainability ? "Food by-products. Useful protein. A circular approach." : "An adult dog recipe. Introduce the new food gradually over seven days."}</p></div></section>
    <section className="trial-details"><div><strong>One small start</strong><p>The same 300 g trial pack, priced at S$9.90.</p></div><div><strong>A gentle switch</strong><p>Introduce the new food gradually over seven days.</p></div><div><strong>A concept, not a purchase</strong><p>No payment is collected and no food is dispatched.</p></div></section>
    <PawKindFooter onVersion={onVersion} onSection={onSection} onResults={() => setResultsOpen(true)} />
    <TrialResults open={resultsOpen} onOpenChange={setResultsOpen} />
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogContent className="trial-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">{session.completed ? "Demo application completed" : "Apply for Trial Pack"}</DialogTitle><DialogDescription>300 g · S$9.90 · Demonstration only. Details are not sent or saved.</DialogDescription></DialogHeader>
        {session.completed ? <div className="flex flex-col items-start gap-4" role="status"><CheckCircle2 className="size-10 text-accent" /><p>Your demo completion is counted once in this browser. No real application, order or payment was created.</p><Button onClick={() => setFormOpen(false)}>Done</Button></div> :
          <form onSubmit={apply} className="grid gap-4">
            <label className="app-field"><span>Your name</span><input name="name" required maxLength={80} placeholder="Demo name" autoComplete="off" /></label>
            <label className="app-field"><span>Email</span><input name="email" type="email" required maxLength={150} placeholder="pet@example.com" autoComplete="off" /></label>
            <fieldset><legend className="app-label mb-2">Recipe</legend><div>{SUPPORTED_RECIPES.map(recipe => <label key={recipe.value} className="check-row"><input type="radio" name="recipe" value={recipe.value} required defaultChecked /> {recipe.label}</label>)}</div></fieldset>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" /><span>I understand this is a demo, not a real trial application.</span></label>
            <Button type="submit" className="min-h-12">Complete demo application <ArrowRight /></Button>
          </form>}
      </DialogContent>
    </Dialog>
  </main>;
}

export function TrialResults({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [totals, setTotals] = useState<Record<"A" | "B", { views: number; clicks: number; completions: number }> | null>(null);
  useEffect(() => {
    if (!open) return;
    void supabase.from("trial_counters").select("variant, views, clicks, completions").then(({ data }) => {
      if (!data) return;
      const next = { A: { views: 0, clicks: 0, completions: 0 }, B: { views: 0, clicks: 0, completions: 0 } };
      for (const row of data) if (row.variant === "A" || row.variant === "B") next[row.variant] = { views: row.views, clicks: row.clicks, completions: row.completions };
      setTotals(next);
    });
  }, [open]);
  const a = totals ? trialMetrics(totals.A.views, totals.A.clicks, totals.A.completions) : ["\u2026", "\u2026", "\u2026", "\u2026"];
  const b = totals ? trialMetrics(totals.B.views, totals.B.clicks, totals.B.completions) : ["\u2026", "\u2026", "\u2026", "\u2026"];
  const labels = ["Unique visitors", "CTA clicks", "Completed trial applications", "Application conversion rate"];

  function download() {
    const csv = [["DEMO ONLY", "All visitors to this site; anonymous counts only"], ["Metric", "A: Sustainability", "B: Nutrition & Trust"], ...labels.map((label, i) => [label, a[i], b[i]])].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "pawkind-demo.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="trial-dialog sm:max-w-3xl">
    <DialogHeader><DialogTitle className="font-display text-2xl">A/B results · demo only</DialogTitle><DialogDescription>Real anonymous counts from every visitor to this site. No names or emails are stored.</DialogDescription></DialogHeader>
    <div className="overflow-x-auto"><table className="trial-table"><caption className="sr-only">Anonymous visitor counts across both versions</caption><thead><tr><th scope="col">Metric</th><th scope="col">A<br /><span>Sustainability</span></th><th scope="col">B<br /><span>Nutrition & Trust</span></th></tr></thead><tbody>{labels.map((label, index) => <tr key={label}><th scope="row">{label}</th><td>{a[index]}</td><td>{b[index]}</td></tr>)}</tbody></table></div>
    <p className="text-sm text-muted-foreground">The conversion rate uses unique trial-screen visitors as the denominator. Repeat clicks and completions count once; no visitors means no rate. These counts are anonymous and do not identify people.</p>
    <Button variant="outline" onClick={download}><Download /> Export demo CSV</Button>
  </DialogContent></Dialog>;
}