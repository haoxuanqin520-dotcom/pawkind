import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";

type ProductCardProps = {
  name: string;
  weight: string;
  price: string;
  unitPrice: string;
  description: string;
  tone: "pink" | "green" | "gold";
  badge?: string;
  featured?: boolean;
};

export function ProductCard(props: ProductCardProps) {
  const [added, setAdded] = useState(false);
  return (
    <article className={`product-card ${props.featured ? "featured" : ""}`}>
      {props.badge && <span className="product-badge">{props.badge}</span>}
      <div className={`product-pack ${props.tone}`} aria-hidden="true">
        <span className="pack-seal"><PawKindMiniMark /></span>
        <strong>PawKind</strong><small>ADULT RECIPE</small><span>{props.weight}</span>
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold">{props.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
      </div>
      <div className="mt-auto flex items-baseline gap-2"><strong className="font-display text-4xl font-extrabold">{props.price}</strong><span className="font-mono text-xs text-muted-foreground">{props.unitPrice}</span></div>
      <button className={`product-button ${added ? "added" : ""}`} type="button" onClick={() => setAdded((value) => !value)}>
        {added ? <><Check className="size-4" /> Added · demo only</> : <><ShoppingBag className="size-4" /> Add {props.weight}</>}
      </button>
    </article>
  );
}

function PawKindMiniMark() {
  return <span className="font-display text-xs font-extrabold">PK</span>;
}