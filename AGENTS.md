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

- Keep PawKind as a single-page, frontend-only product concept with demo commerce and app interactions, because real accounts, orders, and payments are intentionally out of scope.
- Keep the trial experiment in a separate in-page view entered from the homepage; visitors choose version A or B from the homepage; keep one browser-local session with idempotent funnel flags and never collect personal data.
- Keep illustrative results separate from browser-local demo metrics and export both with explicit demo labels, because neither represents a real cross-participant experiment.
