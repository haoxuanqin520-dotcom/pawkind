// The wordmark from the packaging: PawKind set in the soft serif, in cocoa.
export function PawKindLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`wordmark${compact ? " wordmark-compact" : ""}`}>PawKind</span>;
}
