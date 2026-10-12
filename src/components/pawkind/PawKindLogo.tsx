import { PawPrint } from "lucide-react";

export function PawKindLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-display font-extrabold text-foreground">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <PawPrint className="size-5" aria-hidden="true" />
      </span>
      <span className={compact ? "text-xl" : "text-2xl"}>
        Paw<span className="text-primary">Kind</span>
      </span>
    </span>
  );
}