# Purpose

To record the guidance patterns applied across `apps/web` (`F9-S04`, see `docs/04_PROJECT/DECISION_LOG.md#cto-078`) — what tells a user what to do next, and why. This is a reference document, not a standard with its own approval process. It builds directly on `docs/04_PROJECT/DESIGN_SYSTEM.md` (`F9-S01`) and does not repeat that document's token/component inventory.

# Guided Experience Principles

Every primary screen must answer four questions, in this order of visual priority:

1. **Where am I?** — `Breadcrumbs` + `PageHeader` title (established at `F9-S01`).
2. **What happened?** — status Badges, Recent Activity, success/error Banners (established at `F9-S01`).
3. **What should I do next?** — new at this sprint: a single, computed, primary-styled call to action per page. Never more than one `.btn-primary` competing for attention on a page at once — every other action is `.btn-secondary` or `.btn-ghost`.
4. **Why is this important?** — new at this sprint: a one-sentence rationale attached to the primary action itself (`NextStepBanner.description`, `Card.description`), not a separate help system.

# Navigation Flow

**The Dashboard is the single source of truth for "what's next"** on a Project, via `computeNextStep` (`apps/web/app/lib/next-step.ts`) — a pure function over the `ExecutiveDashboard` the Dashboard page already fetches, no new API call. It walks the Verification Workflow in order and returns the first step that isn't yet done:

```
No Baseline set          → "Set a Baseline"                    → Workspace
No Campaign               → "Create an Optimization Campaign"   → Campaign page
Campaign is draft         → "Activate your Campaign"            → Campaign page
Campaign active, <100%     → "Work through your Optimization
                              Actions"                          → Campaign page
Campaign active, 100%      → "Mark your Campaign as Completed"  → Campaign page
Campaign completed,
  no Impact Assessment     → "Run a Verification Audit"         → Workspace
Impact measured, Cycle
  not completed            → "Review your Executive Client
                              Report"                           → Report page
Cycle completed           → "Start your next Optimization
                              Cycle"                             → Workspace
```

Rendered by `NextStepBanner` — a visually distinct, primary-tinted callout placed immediately under the Dashboard's `PageHeader`, above every other card, so it's the first thing seen on the page. This directly satisfies "Dashboard highlights the highest-priority task."

**Progress indicators**: `StageProgress` (`apps/web/app/components/ui/StageProgress.tsx`) renders a horizontal stepper — done stages checked, the current stage highlighted, future stages muted — reused for both the Optimization Cycle (`Planned → Running → Verification → Completed`) and the Optimization Campaign (`draft → active → completed → archived`) lifecycles. This is what "Navigation reflects workflow progression" means concretely: the stepper *is* the workflow-progression indicator, placed directly in the Dashboard's Cycle card and at the top of the Campaign page — a second, separate global progression nav was deliberately not built (see Rejected Scope).

**Primary action promoted per page**:

| Page | Primary action |
|---|---|
| Workspace (`/`) | Analyze (run a new Audit) — already primary since `F9-S01` |
| Dashboard | The computed `NextStepBanner` CTA |
| Optimization Cycle (on Dashboard) | Advance to the next Cycle stage |
| Optimization Campaign | Advance to the next Campaign stage (was secondary-styled before this sprint) |
| Executive Client Report | Back to Dashboard / Go to Workspace, via the new "What's Next" panel at the page's end |
| Audit Detail | View Project Dashboard (was secondary-styled before this sprint; it is the page's only action) |

# User Journey

The end-to-end journey (`Client → Project → Baseline Audit → Findings → Optimization Plan → Optimization Campaign → Verification Audit → Impact Assessment → Optimization Cycle → AI Daily Briefing → AI Consultant Chat → Executive Client Report`, validated at `F8-S01`) is unchanged by this sprint — no step was added, removed, or reordered. What changed is that a user landing on the Dashboard at *any* point in that journey is now told, in one sentence, exactly which of those steps to do next and why, instead of having to infer it from reading every card on the page.

**Empty states now guide toward completion**, not just describe absence: `EmptyState` instances that represent an actionable gap (no Campaign, no Impact Assessment yet) got a `description` explaining what produces the missing data, and the "No Campaign yet" states on both the Dashboard and Campaign page carry a direct `action` button. Empty states that represent *good news* (no Findings, no priority actions) were given reassuring copy instead ("Nothing to fix", "Nothing is currently flagged") — an empty list is not always a gap to close, and treating every empty state identically would misrepresent a healthy Project as an incomplete one.

# Self-Service Onboarding

A six-step guided wizard (`F12-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-081`) at `/onboarding` (`apps/web/app/onboarding/`) extends the same guidance principles above to a brand-new agency's very first session: Welcome → Your Agency → First Client → First Audit → Your Report → Done, rendered via the same `StageProgress` component used for the Optimization Cycle and Campaign (a third reuse of the same generic stepper, this time as the wizard's own progress indicator).

**Reuses every existing capability, adds none**: the "First Client" step is the exact same `createClient` Server Action the Workspace's own "Add a Client" form already calls; "First Audit" is the exact same `createAudit` Server Action (and `useActionState` pattern) the Workspace's own "Run a New Audit" form already calls — Project and Optimization Cycle auto-provisioning (`CTO-059`/`CTO-071`) already do the "workspace initialization" this ticket asked for, unchanged. "Your Report" reads the same `analysis`/`optimizationPlan`/`aiVisibility` fields the Workspace page has rendered since `F3`/`F6`, just trimmed to a top-3 summary with a link to the full Audit page. No new `apps/api` endpoint, contract, or domain concept was introduced.

**"Organization"/"Agency profile" has no backend concept to attach to, so it stays client-side**: this platform has no accounts or multi-tenancy (`CTO-075`, `PRODUCTION_READINESS.md`'s Rejected Scope) — there is exactly one implicit workspace, and `Client` already means "the agency's own customer," not "the agency itself." Inventing a real `Organization` aggregate purely to satisfy this ticket's checklist would be a new business capability the ticket's own "Reuse existing business capabilities" explicitly argues against. The Agency profile (name, optional website) is saved to `localStorage` (`apps/web/app/lib/onboarding-storage.ts`) purely to personalize the wizard's copy ("Add the business whose AI Visibility you'll be auditing for Bright Digital Agency") — it is never sent to the API and makes no claim of being a persisted account record, the same reasoning already applied to Proactive Recommendation dismissal (`CTO-079`).

**Resumable, not just linear**: a returning visitor who already has a Client and a completed Audit (created via the wizard or the Workspace's own forms) skips straight to the "Done" success checklist showing their actual data, rather than being forced to repeat steps — the wizard reads only already-existing data (`listClients`, `listAudits`, `getAuditAnalysis`, `listProjects`) to determine this, no new API calls. Verified live: a fresh Client ("Wizard Test Co") was created end-to-end through all six steps, including a real Audit run against a real (deliberately unreachable) domain producing genuine `not-ready` Findings; reloading `/onboarding` afterward correctly resumed to "Done" showing that same Client, not the pre-existing demo Client that also exists in the workspace — confirming the resume logic correlates Client → Project → Audit correctly rather than assuming the first Client returned by the API is the relevant one.

**Never exposes technical concepts**: wizard copy speaks only in terms the product already uses elsewhere (agency, client, website, Audit, AI Visibility report) — no aggregate/DTO/workflow-runtime/correlation-id language, consistent with the Design System's "no developer-oriented text" baseline (`CTO-077`).

**Existing functionality preserved**: the Workspace home page's forms and Client/Project listing are entirely unchanged; the wizard is reached via a new "Get Started" action added to the home page's existing empty-state banner (shown only when there are zero Clients and zero Projects, exactly the same condition that already gated that banner before this sprint), not a replacement for it.

# Rejected Scope

- **A second, page-independent workflow-progress nav** (e.g., a persistent sidebar stepper spanning the whole 12-step journey). Rejected — the Cycle's `StageProgress` on the Dashboard already communicates macro position in the Verification Workflow, and `NextStepBanner` already tells the user the single next step; a second, always-visible global stepper would duplicate both without adding new information, and this sprint's own TASKS ask to "reduce unnecessary clicks," not add persistent chrome.
- **A dedicated "contextual help" system** (tooltips, a help sidebar, `?` icon popovers). Rejected as new UI infrastructure beyond "focus exclusively on reducing user uncertainty" — the "why" a user needs is already answered inline, next to the action it explains (`NextStepBanner.description`, `Card.description`), which is more likely to be read than a separate help affordance the user has to seek out.
- **Per-project guidance on the Workspace home page** (fetching each Project's Dashboard-equivalent data just to show a next-step hint in the Client/Project list). Rejected — the home page's job stays inventory and Audit creation; the "Open Dashboard" link (unchanged) is exactly one click from the full guided view, and fetching full Dashboard state for every Project listed on the home page would be new complexity for no benefit over that one click.
- **New business logic to decide "what's next"**: `computeNextStep` reads only fields the Dashboard already fetches (`project.baselineAuditId`, `campaign`, `campaignImpact`, `currentCycle`) and contains no new domain rule, no new persisted state, and no new API call — it is presentation-layer sequencing of an already-existing, already-validated workflow (`F8-S01`), not a new capability.
- **A real `Organization`/account aggregate, or any form of authentication** (`F12-S01`). Rejected — this platform has never had accounts or multi-tenancy, every prior sprint that touched the edge of this question deferred it (`CTO-075`, `PRODUCTION_READINESS.md`), and `F12-S01`'s own "Reuse existing business capabilities" argues directly against inventing one just to make an onboarding checklist item feel more real than a `localStorage`-held profile actually is.
- **Server-persisted onboarding progress/completion state**. Rejected for the same reason Proactive Recommendation dismissal stayed client-side (`CTO-079`) — there is no account to scope such a record to, and the wizard's own resume logic already reconstructs "how far along is this workspace" correctly from real Client/Audit data without needing a dedicated progress record.
