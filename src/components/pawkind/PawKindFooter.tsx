import { PawKindLogo } from "./PawKindLogo";

export const NAV_LINKS = [
  ["/#passport", "Your dog"],
  ["/#food", "The food"],
  ["/#inside", "What's inside"],
  ["/#faq", "Questions"],
  ["/wall", "Dog wall"],
] as const;

export function PawKindFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <PawKindLogo compact />
          <p>Care in every bowl.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <p className="footer-note">
          PawKind is a concept by an NUS student team in Singapore. The recipe, packaging and prices
          are in development. No real orders or payments are taken.
        </p>
      </div>
    </footer>
  );
}
