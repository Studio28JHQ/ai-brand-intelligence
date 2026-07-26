# Purpose

To record what "ready for a real pilot agency" means for this product, and how that readiness was validated (`F8-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-075`). This is an operational record, not a standard — it does not redefine any capability documented in `docs/04_PROJECT/CURRENT_STATE.md`.

# Pilot Checklist

- [x] Complete workflow executable end to end without developer support (`F8-S01`, see `CTO-073`).
- [x] Demo workspace available, seeded with one command (`apps/api/scripts/seed-demo.js`, `pnpm --filter @ai-visibility/api run seed:demo`).
- [x] Demo Client, Demo Project, Demo Optimization Cycle, Demo AI Daily Briefing, and Demo Executive Client Report all produce real, non-empty content.
- [x] Every screen reviewed for an empty state, a loading state, an error state, and success feedback (see "Screens Reviewed" below).
- [x] Navigation consistency verified — every project-scoped page (Dashboard, Campaign, Consultant, Report) links back to the Dashboard, and the Dashboard links out to all of them; the Audit Detail page links to its Project's Dashboard.
- [x] Onboarding flow completed — a workspace with no Clients or Projects shows an explanatory "Get Started" message instead of a bare, unexplained empty screen.
- [x] `pnpm -r build` passes across the whole monorepo.
- [ ] Real pilot agency onboarded (outside this repository's scope — this checklist covers product readiness, not the business process of running a pilot).

# Screens Reviewed

| Screen | Empty state | Loading state | Error state | Success feedback |
| --- | --- | --- | --- | --- |
| Workspace home (`/`) | "Get Started" onboarding message when no Clients/Projects exist; "No Clients yet." / "No Projects for this Client yet." / "No Audits yet." per section | "Loading workspace..." while the initial fetch batch resolves | Audit-creation and Client-creation errors shown inline | Client-created and Baseline-set confirmations added (`F8-S02`) |
| AI Daily Briefing (embedded in `/`) | "Nothing needs your attention..." only when the Briefing genuinely has zero items | "Generating briefing..." | "Unable to load the briefing right now." — now distinct from the empty state (`F8-S02` fix; previously conflated fetch failure with "nothing to report") | N/A (read-only) |
| Executive Dashboard (`/projects/:id/dashboard`) | "Dashboard not available." | `loading.tsx` route-level loading UI (`F8-S02`) | Same as empty state (Project/Client not found) | N/A (read-only; mutations happen in `CycleManager`) |
| Optimization Cycle section (`CycleManager`) | "No optimization cycle yet..." | "Loading current cycle..." | N/A (`transitionCycleStatus` returns a boolean) | Transition confirmation message added (`F8-S02`) |
| Optimization Campaign (`/projects/:id/campaign`) | "No campaign yet for this project." | "Loading Campaign..." added (`F8-S02`) | Inline error message | Creation/transition confirmation messages added (`F8-S02`) |
| AI Consultant Chat (`/projects/:id/consultant`) | Empty history before the first question (expected — no message needed) | "Thinking..." | Inline error message | The answer itself is the success feedback |
| Executive Client Report (`/projects/:id/cycles/:cycleId/report`) | "Report not available for this cycle." | `loading.tsx` route-level loading UI (`F8-S02`) | Same as empty state | N/A (read-only) |
| Audit Detail (`/audits/:id`) | "Audit not found." / "No findings recorded." / "No optimization items." | `loading.tsx` route-level loading UI (`F8-S02`) | Same as empty state | N/A (read-only) |
| Global | — | — | `app/error.tsx` route-segment error boundary added as a safety net for unexpected render errors (`F8-S02`) | — |

# Demo Data Strategy

`apps/api/scripts/seed-demo.js` (`pnpm --filter @ai-visibility/api run seed:demo`) seeds a Demo Client ("Acme Digital (Demo)"), Demo Project, and a full Optimization Cycle with real Findings, a completed Optimization Campaign, a Verification Audit, and an Impact Assessment — so the AI Daily Briefing and Executive Client Report both have genuine content to demonstrate, not empty sections.

**Why direct data seeding was necessary, and where the line was drawn**: every step the seed script performs against a real URL uses the real HTTP API exactly as an agency would (`POST /clients`, `POST /audits`, `POST /projects/:id/baseline`, `POST /projects/:id/campaigns`, campaign/action/cycle status transitions) — no business logic is reimplemented. The one exception is flipping two of the three Findings the real Analysis Engine already inserted for the initial Audit from `pass`/`none` to `fail`/`warning` via a direct Prisma update. This is necessary because the only Analysis Rules implemented today are execution-status checks (`F6-S06`) that pass for any successfully-crawled site (`docs/04_PROJECT/CURRENT_STATE.md`'s "Known, accepted limitation," first documented at `CTO-073`) — a real crawl of a real URL essentially never fails them on its own. The seed script does not add a rule, a Finding type, or any new business capability; it only sets the `outcome`/`severity` columns an existing Finding row already has, the same technique used throughout `F6`–`F8` to prove business logic correct with synthetic data.

**Idempotency**: re-running the script reuses the Demo Client/Project (found by `primaryDomain`/canonical website, the same auto-provisioning behavior `CTO-059` established) but always creates a fresh Audit and, depending on the current Cycle's status, a fresh Optimization Cycle — each run represents one fresh demo pass rather than mutating a frozen fixture.

# Onboarding Flow

A brand-new workspace (no Clients, no Projects) now shows an explanatory "Get Started" message on the home page instead of a bare form with no context (`F8-S02`): it explains that pasting a URL and clicking Analyze auto-provisions a Client and Project, or that a Client can be created explicitly first to group multiple Projects under one customer. This mirrors the auto-provisioning behavior already documented in `CTO-059` — the onboarding copy explains existing behavior, it does not change it.

# Rejected Scope

- **Persisting the demo dataset in a migration or fixture file.** Rejected because the demo data is ordinary application data (Clients/Projects/Audits/Findings), not schema — it belongs in the database, produced by running the seed script, not baked into a migration that would run against every environment including a real pilot's production data.
- **A guided in-app onboarding wizard (tour, multi-step setup).** Rejected as a new business capability beyond "prioritize usability over new functionality" — a one-paragraph explanatory message on an already-empty screen was judged sufficient for pilot readiness.
