import { PawPrint } from "lucide-react";
import type { ReactNode } from "react";

import { photoUrl } from "./dog-wall";

// One photo on the wall: a square print in a paper frame with the dog's name below.
export function WallFrame({
  name,
  breed,
  path,
  children,
  eager = false,
}: {
  name?: string;
  breed?: string | null;
  path?: string;
  children?: ReactNode;
  eager?: boolean;
}) {
  return (
    <figure className="wall-frame">
      <div className="wall-print">
        {path ? (
          <img
            src={photoUrl(path)}
            alt={`${name ?? "A dog"}${breed ? `, a ${breed}` : ""}`}
            loading={eager ? "eager" : "lazy"}
          />
        ) : (
          <PawPrint aria-hidden="true" />
        )}
      </div>
      <figcaption>
        {name && <strong>{name}</strong>}
        {breed && <span>{breed}</span>}
      </figcaption>
      {children}
    </figure>
  );
}

export function WallFrameSkeleton() {
  return (
    <div className="wall-frame wall-frame-skeleton" aria-hidden="true">
      <div className="wall-print" />
      <div className="wall-skeleton-line" />
    </div>
  );
}
