import { Menu, X } from "lucide-react";
import { useState } from "react";

import { NAV_LINKS } from "./PawKindFooter";
import { PawKindLogo } from "./PawKindLogo";

type Props = {
  // On the homepage the button opens the trial dialog. Elsewhere it links to the food section.
  onApply?: () => void;
  current?: string;
};

export function SiteHeader({ onApply, current }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const cta = (className: string) =>
    onApply ? (
      <button
        type="button"
        className={className}
        onClick={() => {
          close();
          onApply();
        }}
      >
        Apply for the trial
      </button>
    ) : (
      <a className={className} href="/#food" onClick={close}>
        See the food
      </a>
    );

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a href={onApply ? "#top" : "/"} aria-label="PawKind home" onClick={close}>
          <PawKindLogo />
        </a>
        <nav className="header-nav" aria-label="Main">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} aria-current={current === href ? "page" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        {cta("btn btn-primary btn-small header-cta")}
        <button
          type="button"
          className="menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={close}
              aria-current={current === href ? "page" : undefined}
            >
              {label}
            </a>
          ))}
          {cta("btn btn-primary")}
        </nav>
      )}
    </header>
  );
}
