import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Leaf, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/pawkind-hero.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PawKindLogo } from "./PawKindLogo";
import { type TrialVariant, parseTrial, recordTrial, trialMetrics, TRIAL_STORAGE_KEY, type TrialSession } from "./trial-demo";

export function TrialExperiment({ onBack, variant }: { onBack: () => void; variant: TrialVariant }) {
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
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    void supabase.rpc("record_trial_event", { _variant: session.variant, _event: "view" });
    void supabase.from("trial_counters").select("clicks").eq("variant", session.variant).single()
      .then(({ data }) => { if (data) setLiveCount(data.clicks); });
  }, [session.variant]);

  function update(event: "click" | "complete") {
    const next = recordTrial(session, event);
    setSession(next);
    try { localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next)); }
    catch { setSaved(false); }
    void supabase.rpc("record_trial_event", { _variant: next.variant, _event: event === "click" ? "click" : "complete" });
    if (event === "click") setLiveCount((n) => (n === null ? null : n + 1));
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update("complete");
  }

  const sustainability = session.variant === "A";
  return <main className="min-h-screen bg-background text-foreground">
    <header className="site-header"><PawKindLogo /><Button variant="ghost" onClick={onBack}><ArrowLeft /> Back to PawKind</Button></header>
    <section className="trial-stage" aria-labelledby="trial-title" data-variant={session.variant}>
      <img src={heroImage} alt="A West Highland terrier and grey cat beside a PawKind food pouch" className="trial-image" />
      <div className="trial-shade" />
      <div className="trial-content">
        <p className="eyebrow">PawKind · 300 g trial pack</p>
        <h1 id="trial-title">{sustainability ? <>A kinder bowl.<br />A lighter footprint.</> : <>Nutrition first.<br />Trust in every bowl.</>}</h1>
        <p className="trial-message">{sustainability ? "Explore a circular protein: Black Soldier Fly larvae turn food by-products into useful nutrition, reducing reliance on conventional livestock protein." : "Explore adult dog and cat recipes with Black Soldier Fly protein, a careful 7-day transition and sample ingredient-to-bag traceability."}</p>
        <div className="trial-benefit">{sustainability ? <Leaf /> : <ShieldCheck />}<span>{sustainability ? "Food by-products. Useful protein. A circular approach." : "Ingredient transparency. Careful transition. Pet-first guidance."}</span></div>
        <div className="trial-price"><strong>S$9.90</strong><span>300 g · adult dog or cat recipe</span></div>
        <Button size="lg" className="h-auto min-h-12 whitespace-normal" onClick={() => { update("click"); setFormOpen(true); }}>Apply for Trial Pack <ArrowRight /></Button>
        {liveCount !== null && <p className="text-sm text-muted-foreground" aria-live="polite">{liveCount} {liveCount === 1 ? "person has" : "people have"} clicked this button so far.</p>}
        <p className="demo-note">Demo only · no payment, delivery or real application.</p>
        {!saved && <p role="status" className="text-sm text-muted-foreground">Browser storage is unavailable. This demo lasts until you leave this screen.</p>}
      </div>
    </section>
    <section className="trial-details"><div><strong>One small start</strong><p>The same 300 g trial pack, priced at S$9.90.</p></div><div><strong>A gentle switch</strong><p>Introduce the new food gradually over seven days.</p></div><div><strong>A concept, not a purchase</strong><p>No payment is collected and no food is dispatched.</p></div></section>
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogContent className="trial-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">{session.completed ? "Demo application completed" : "Apply for Trial Pack"}</DialogTitle><DialogDescription>300 g · S$9.90 · Demonstration only. Details are not sent or saved.</DialogDescription></DialogHeader>
        {session.completed ? <div className="flex flex-col items-start gap-4" role="status"><CheckCircle2 className="size-10 text-accent" /><p>Your demo completion is counted once in this browser. No real application, order or payment was created.</p><Button onClick={() => setFormOpen(false)}>Done</Button></div> :
          <form onSubmit={apply} className="grid gap-4">
            <label className="app-field"><span>Your name</span><input name="name" required maxLength={80} placeholder="Demo name" autoComplete="off" /></label>
            <label className="app-field"><span>Email</span><input name="email" type="email" required maxLength={150} placeholder="pet@example.com" autoComplete="off" /></label>
            <fieldset><legend className="app-label mb-2">Recipe</legend><div className="grid grid-cols-2 gap-3"><label className="check-row"><input type="radio" name="recipe" value="dog" required /> Adult dog</label><label className="check-row"><input type="radio" name="recipe" value="cat" required /> Adult cat</label></div></fieldset>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" /><span>I understand this is a demo, not a real trial application.</span></label>
            <Button type="submit" className="min-h-12">Complete demo application <ArrowRight /></Button>
          </form>}
      </DialogContent>
    </Dialog>
  </main>;
}

export function TrialResults({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [source, setSource] = useState<"all" | "local" | "example">("all");
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
  let session: TrialSession | null = null;
  if (open) { try { session = parseTrial(localStorage.getItem(TRIAL_STORAGE_KEY)); } catch { /* No stored session. */ } }
  const counts = (variant: "A" | "B") => source === "all" ? (totals ? trialMetrics(totals[variant].views, totals[variant].clicks, totals[variant].completions) : ["\u2026", "\u2026", "\u2026", "\u2026", "\u2026"]) : source === "example" ? (variant === "A" ? trialMetrics(30, 12, 6) : trialMetrics(30, 18, 12)) : trialMetrics(session?.variant === variant ? 1 : 0, session?.variant === variant && session.clicked ? 1 : 0, session?.variant === variant && session.completed ? 1 : 0);
  const a = counts("A"), b = counts("B");
  const labels = ["Unique visitors", "CTA clicks", "Completed trial applications", "Click-through rate", "Application conversion rate"];

  function download() {
    const csv = [["DEMO ONLY", source === "all" ? "All visitors to this site; anonymous counts only" : source === "example" ? "Illustrative sample; not actual results" : "This browser only; not participant data"], ["Metric", "A: Sustainability", "B: Nutrition & Trust"], ...labels.map((label, i) => [label, a[i], b[i]])].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `pawkind-${source}-demo.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="trial-dialog sm:max-w-3xl">
    <DialogHeader><DialogTitle className="font-display text-2xl">A/B results · demo only</DialogTitle><DialogDescription>{source === "all" ? "Real anonymous counts from every visitor to this site. No names or emails are stored." : source === "local" ? "Only this browser's demo activity. Not shared across visitors or devices." : "Illustrative numbers from your team's example. Not actual test results or evidence that one message wins."}</DialogDescription></DialogHeader>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Results source"><Button variant={source === "all" ? "default" : "outline"} aria-pressed={source === "all"} onClick={() => setSource("all")}>All visitors</Button><Button variant={source === "local" ? "default" : "outline"} aria-pressed={source === "local"} onClick={() => setSource("local")}>This browser</Button><Button variant={source === "example" ? "default" : "outline"} aria-pressed={source === "example"} onClick={() => setSource("example")}>Illustrative example</Button></div>
    <div className="overflow-x-auto"><table className="trial-table"><caption className="sr-only">{source === "local" ? "Browser-local demo results" : "Illustrative sample results"}</caption><thead><tr><th scope="col">Metric</th><th scope="col">A<br /><span>Sustainability</span></th><th scope="col">B<br /><span>Nutrition & Trust</span></th></tr></thead><tbody>{labels.map((label, index) => <tr key={label}><th scope="row">{label}</th><td>{a[index]}</td><td>{b[index]}</td></tr>)}</tbody></table></div>
    <p className="text-sm text-muted-foreground">Rates use unique trial-screen visitors as the denominator. Repeat clicks and completions count once; no visitors means no rate. Browser data can be cleared and does not identify people.</p>
    <Button variant="outline" onClick={download}><Download /> Export demo CSV</Button>
  </DialogContent></Dialog>;
}