<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PawKind project rules

- PawKind is a single-page concept for one product: the adult dog recipe with Black Soldier Fly protein (the former "Version B"). The A/B test is over: do not add version choices, version pages or A/B results views back.
- No real accounts, orders or payments. Every trial button says "Apply for the trial" and opens the one `TrialDialog`; it collects nothing and states that no payment is taken.
- Page order: hero, Dog Passport, product, Nutrition Explorer, owner research, dog wall teaser, FAQ, final call to action.
- Visual direction follows Packaging Concept 01: warm cream about 60%, caramel about 25%, cocoa about 12%, sage about 3% (tokens in `src/styles.css`). Display type is Fraunces (soft), body is Figtree, both self-hosted in `public/fonts`. Bag images are `src/assets/pack-*.webp`.
- Honesty rules, from the team's MVP review:
  - The recipe is not nutritionally validated, so the Dog Passport (`passport.ts`) never shows one precise portion: only an indicative range for healthy adults, labelled as such.
  - Puppies and pregnant or nursing dogs are "not suitable"; vet diets, allergies or sensitive stomachs and dogs over 7 go to "check with your vet first", with no portion.
  - The Nutrition Explorer keeps general ingredient facts separate from PawKind's own status. Nothing is marked verified until lab results exist, and the FAQ testing list must match the real status.
- Lovable Cloud: `public.trial_counters` and `record_trial_event` hold the archived A/B results. The site no longer writes to them.
- Dog wall (`/wall`, team-only `/wall-review`, homepage `WallTeaser`):
  - Backend setup lives in `docs/dog-wall.sql` and is applied in Lovable Cloud. Visitors only reach the data through its functions (`submit_dog_wall_post`, `list_dog_wall`, `my_dog_wall_posts`, `remove_dog_wall_post`); never add direct table access.
  - Photos go on the wall as soon as they are shared (team decision, `docs/dog-wall-update-1-no-review.sql`). The team can take any photo down on `/wall-review` with the team key. The site accepts at most 40 new photos per 10 minutes.
  - Photos are resized and re-encoded in the browser (`dog-wall.ts`), which strips location data. Only the dog's name and an optional breed are collected, nothing about the owner.
  - Each browser keeps a random owner token so owners can take their own photos down.
