import { createFileRoute } from "@tanstack/react-router";

import { DogWall } from "@/components/pawkind/DogWall";
import { PawKindFooter } from "@/components/pawkind/PawKindFooter";
import { SiteHeader } from "@/components/pawkind/SiteHeader";

export const Route = createFileRoute("/wall")({
  head: () => ({
    meta: [
      { title: "The PawKind dog wall | Share your dog" },
      {
        name: "description",
        content:
          "Share a photo of your dog on the PawKind wall. Every photo is checked by the team before it appears.",
      },
      { property: "og:title", content: "The PawKind dog wall" },
      { property: "og:description", content: "Show us who the bowl is for." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WallPage,
});

function WallPage() {
  return (
    <main className="page wall-page">
      <SiteHeader current="/wall" />
      <DogWall />
      <PawKindFooter />
    </main>
  );
}
