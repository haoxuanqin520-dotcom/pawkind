import { createFileRoute } from "@tanstack/react-router";

import { PawKindFooter } from "@/components/pawkind/PawKindFooter";
import { SiteHeader } from "@/components/pawkind/SiteHeader";
import { WallReview } from "@/components/pawkind/WallReview";

// Team-only moderation page. Not linked from the site and kept out of search results.
export const Route = createFileRoute("/wall-review")({
  head: () => ({
    meta: [
      { title: "Review dog wall photos | PawKind" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WallReviewPage,
});

function WallReviewPage() {
  return (
    <main className="page wall-page">
      <SiteHeader />
      <WallReview />
      <PawKindFooter />
    </main>
  );
}
