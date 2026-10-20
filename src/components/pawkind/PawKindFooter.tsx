import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PawKindLogo } from "./PawKindLogo";

export function PawKindFooter({ onVersion, onResults, onSection }: { onVersion: (version: "A" | "B") => void; onResults: () => void; onSection?: (section: string) => void }) {
  return <footer className="pawkind-footer">
    <div className="footer-brand"><PawKindLogo compact /><p>Good for Pets. Kinder for the Planet.</p><span>Singapore · NUS student project</span></div>
    <nav className="footer-links" aria-label="Footer navigation">
      {([["how", "How it works"], ["research", "Research"], ["app", "The app"], ["packs", "Packs"]] as const).map(([id, label]) => <a key={id} href={`#${id}`} onClick={onSection ? (event) => { event.preventDefault(); onSection(id); } : undefined}>{label}</a>)}
      <Button variant="link" onClick={() => onVersion("A")}>Version A</Button><Button variant="link" onClick={() => onVersion("B")}>Version B</Button>
    </nav>
    <Button variant="outline" className="footer-results" onClick={onResults}>A/B test results <ArrowRight /></Button>
    <p className="footer-disclaimer">Concept prototype for an NUS student project · No real orders or payments are created.</p>
  </footer>;
}