# Purpose

To record the visual design language, UX conventions, and navigation principles applied across `apps/web` (`F9-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-077`). This is a reference document, not a standard with its own approval process — it describes what was built and why, so future screens stay consistent with it rather than reinventing conventions.

# Design System

**No external UI framework or component library was added.** Everything is hand-authored CSS custom properties and a small set of presentational React components — consistent with this project's existing "no new dependency without a reason" posture, and appropriate for a single Next.js app of this size.

**Tokens** (`apps/web/app/globals.css`, `:root`): color (`--color-*` — surface/background/border/text at three emphasis levels, one primary accent, and four semantic colors: success/warning/danger/info, each with a paired `-surface`/`-border` for badges and banners), spacing (`--space-1` through `--space-7`, a 4px-based scale), typography (`--text-xs` through `--text-3xl`, system font stack — no web font loading, so there is no render-blocking network dependency), radius, and shadow.

**Components** (`apps/web/app/components/ui/`), all plain presentational components with no business logic:

- `PageHeader` — title, optional description, optional actions slot. Every page has exactly one.
- `Breadcrumbs` — see Navigation Principles below.
- `Card` — the primary content container; supports a `title` (renders as `<h2>` with an optional actions slot) and a `muted` variant for nested/secondary cards.
- `Badge` — a small status pill. `statusToVariant(value)` maps the vocabulary already used throughout this codebase (Audit/Campaign/Cycle/Action status, Finding severity/outcome, AI Visibility status, trend values) to a color. **Confidence values use a separate, fixed `CONFIDENCE_VARIANT`, never the auto-mapping** — see "One real bug found and fixed" below.
- `Banner` — an inline alert (`success`/`error`/`info`), replaces every bare `<p>Error: ...</p>` that existed before this sprint.
- `EmptyState` — a consistent "nothing here yet" block (icon, title, optional description, optional action), used everywhere a list could legitimately be empty.
- `Skeleton` / `SkeletonBlock` — loading placeholders, used both inline (while a client component's first fetch is in flight) and in route-level `loading.tsx` files.
- `ConfirmButton` — a native `<dialog>`-based confirmation modal, used for the two irreversible transitions in the product (Optimization Cycle → `completed`, Optimization Campaign → `archived`). See Confirmation Dialogs below.

**Tables**: every genuinely tabular listing (Clients' Projects/Audits, Findings, Optimization Actions, Execution Timeline) is a real `<table>` with a `<thead>`, wrapped in `.table-wrapper` (`overflow-x: auto`) for narrow viewports — not a `<ul>` imitating a table, which is what existed before this sprint.

# UX Guidelines

Every screen was reviewed against a fixed checklist — this is the checklist future screens should also satisfy:

- **Empty state**: every list/collection renders `EmptyState` when it has zero items, with copy specific to what's missing (never a generic "No data").
- **Loading state**: route segments that are `async` Server Components doing a real data fetch (Dashboard, Audit Detail, Executive Client Report) have a `loading.tsx` using `SkeletonBlock`. Client components that fetch their own data on mount (`CycleManager`, `CampaignManager`, `DailyBriefing`, `ConsultantChat`) track their own `loading` boolean and render a skeleton or explicit loading text instead of a blank flash.
- **Error state**: `Banner variant="error"` for expected failures (a Server Action returning an error); `app/error.tsx` (route-segment boundary) and `app/not-found.tsx` for unexpected ones. Both fetch-failure and genuinely-empty results must be visually distinct — see "One real bug found and fixed" below.
- **Success feedback**: every state-changing action (Client created, Baseline set, Campaign/Action/Cycle status transitions) now sets and displays a `Banner variant="success"` confirmation. Before this sprint, most of these silently refreshed with no acknowledgment.
- **Confirmation dialogs**: `ConfirmButton` gates the two transitions in the product that cannot be undone (Cycle → `completed`, Campaign → `archived`) behind an explicit native `<dialog>` confirmation. Reversible transitions (e.g., Action → `in-progress` → `completed` → `verified`) do not require confirmation — gating every click would slow down the common path for no safety benefit.
- **No raw JSON, no developer-only text**: every field is rendered as a labeled `<dt>`/`<dd>` pair or a table cell, never a dumped object. Long identifiers (Audit/Campaign/Project ids) are still shown — they're operationally useful for an alpha-stage support workflow — but de-emphasized as small monospace secondary text rather than a first-class "ID: <uuid>" label.

**One real bug found and fixed during this sprint**: `Badge`'s `statusToVariant` mapped the literal string `"high"` to the danger (red) color, correct for severity/priority ("high severity" is bad) but backwards for confidence ("high confidence" is good). Every confidence badge (`AI Daily Briefing`, `AI Consultant Chat`, `Executive Client Report`) was rendering "high confidence" in red before this was caught by live browser verification and fixed with a dedicated `CONFIDENCE_VARIANT` constant that confidence badges must pass explicitly.

**A second real bug found and fixed**: `ConfirmButton`'s `.dialog` CSS rule set `display: flex` unconditionally, overriding the browser's native `display: none` default for a closed `<dialog>` — so a closed dialog rendered inline in the page flow instead of staying hidden, and reopening/closing it produced confusing layout artifacts. Fixed by scoping the flex layout to `.dialog[open]` only. Caught by live interaction testing, not by the build (TypeScript/CSS both compiled without error — this was a runtime/visual defect only a real browser check could catch).

# Navigation Principles

- **One persistent header** (`AppHeader`, in the root layout), present on every screen. As of the public landing page (`F9-S01`, second use of this sprint id — see "Public Marketing Site" below), `AppHeader` renders one of two modes based on route: the public marketing nav (`MarketingHeader`) on `/`, or the existing minimal internal brand bar everywhere else — chosen client-side by `usePathname()`, not by two separate layouts, so every internal route keeps the exact chrome it already had.
- **Breadcrumbs on every non-home internal screen**, always ending in the current page (not a link) and starting from "Workspace" (`/workspace` as of `F9-S01`'s second use — see below; previously `/`). Dashboard shows `Workspace > {Project}`; Campaign/Consultant/Report show `Workspace > Dashboard > {Page}`; Audit Detail shows `Workspace > Audit`.
- **Hub-and-spoke, not a chain**: the Dashboard is the hub for a Project — it links out to Consultant, Campaign, and (via the Cycle section) the Executive Client Report. Each spoke page links back to the Dashboard, not sideways to its sibling spokes — this was already the shape before this sprint and was preserved, not redesigned.
- **One gap closed**: the Audit Detail page previously had no way back to its Project's Dashboard except returning to the workspace home and re-finding the Project — already fixed at `F8-S01` (`CTO-073`) with a "View Project Dashboard" link; this sprint only restyled it.
- **Reduced-click review**: every workflow from `F8-S01`'s validated end-to-end sequence was walked again during this sprint's browser verification; no additional clicks were required by any restyle, and none were removed — this was explicitly a "do not redesign business workflows" sprint.

# Public Marketing Site

A public landing page at `/` (`apps/web/app/page.tsx`), delivered by a ticket self-identified as `F9-S01` — see the "Sprint id collision" note in `docs/04_PROJECT/DECISION_LOG.md#cto-083` for how this was resolved, since `F9-S01` had already been used by Product Experience Polish (`CTO-077`). This section documents the landing page and navigation only; the collision itself is a Decision Log concern, not repeated here.

**The existing Workspace moved from `/` to `/workspace`**, since a "public entry point to the platform" and the internal, always-open Workspace can't both live at the same route. Every internal link that pointed at `/` (breadcrumbs, `computeNextStep`'s "Go to Workspace" CTAs, `error.tsx`/`not-found.tsx`, the Onboarding wizard's "Back to Workspace") was updated to `/workspace` — nothing about the Workspace itself changed, only its address. `/onboarding` and every `/projects/*`, `/audits/*` route were left exactly where they were.

**One page, in-page anchors, not separate routes**: `Product` (`#product`), `How It Works` (`#how-it-works`), `Platform` (`#platform`), and `About` (`#about`) in `MarketingHeader`'s nav are anchors into the landing page's own sections — the ticket specifies eight sections on one page, not a multi-page marketing site, so no new routes were created for them.

**Every "Platform Capabilities" claim maps to an already-shipped capability**, per the ticket's "Do not invent features": AI Visibility Audits (`F3`/`F6`), AI Consultant (`F7-S03`/`F10-S01`), Optimization Campaigns (`F6-S04`), Executive Reports (`F7-S06`), Continuous Verification (`F4-S03`), Business Impact Analysis (`F6-S05`) — each description is a factual restatement of what that feature already does, not aspirational copy.

**The "Executive Dashboard Preview" section is explicitly labeled illustrative**, using real components (`Card`, `Badge`) with generic status values (`ready`, `verification`, `active` — the platform's own real vocabulary) rather than any specific number presented as a metric, per "Do not fabricate business metrics."

**Footer links only go where something real exists**: "Product" anchors to `#product`; "Documentation" links to the API's own Swagger UI (`${API_URL}/docs`, `CTO-076`) — a genuine, already-reachable page, reusing an existing capability rather than inventing a public docs site. "Privacy," "Terms," and "Contact" render as plain, non-interactive text (not a link, not a 404) — no such pages exist yet and fabricating a destination for them would be worse than honestly showing they aren't available yet.

**Fast-loading by construction**: the landing page is a Server Component with zero client-side data fetching (unlike the former `/` Workspace page, which was `'use client'`) — Next.js prerenders it fully statically (`○` in the build output). Verified live: exactly one `<h1>`, hierarchical `<h2>`s per section, all four semantic landmarks (`header`/`nav`/`main`/`footer`) present, and page-level `<meta name="description">`/OpenGraph tags distinct from the internal app's layout-level metadata.

# Accessibility Baseline

- Semantic landmarks: `<header>` (`AppHeader`), `<nav aria-label="Breadcrumb">`, `<main>` per page — already present before this sprint for `<main>`, extended here.
- Every form input has an associated `<label>` (visually hidden via `.visually-hidden` where a placeholder alone would otherwise be the only label, e.g. the Consultant Chat's free-text question field).
- `:focus-visible` gets a visible 2px outline (`globals.css`) — the browser default was not suppressed.
- Decorative icons are `aria-hidden="true"`; `Banner` uses `role="alert"` (error) or `role="status"` (success/info); `EmptyState` uses `role="status"`.
- Color contrast: every text/background and badge-text/badge-background pairing in the token set was checked against WCAG AA (4.5:1 for normal text) using the actual rendered hex values, not estimated. Three tokens were darkened after the initial pass failed this check: `--color-text-tertiary` (3.20:1 → 4.83:1), `--color-success` (3.12:1 → 4.76:1), `--color-danger` (4.41:1 → 5.91:1).
- Responsive layout verified at a genuine ~800px viewport (an in-page same-origin iframe, since the browser automation tool's window-resize did not propagate to the tab's actual rendered viewport in this environment) — confirmed `.grid-2` correctly collapses to a single column and page padding reduces per the `@media (max-width: 900px)` rules in `globals.css`.

# Rejected Scope

- **A third-party UI/component library** (e.g., a headless-UI kit). Rejected — the app's screen count and component variety did not justify the dependency weight, and a hand-authored token system stays trivially auditable.
- **A design-token build pipeline** (Tailwind, CSS-in-JS, a theming package). Rejected as unrequested scope beyond "focus exclusively on product quality and usability" — plain CSS custom properties fully satisfy "unified design system" without new tooling.
- **Redesigning any business workflow** (e.g., collapsing the home page's inline Audit/Project/Client management into separate pages). Explicitly out of scope per the ticket; every existing workflow's step count and information was preserved exactly, only its presentation changed.
- **Real authentication** (`/login`, second use of `F9-S01`). The ticket explicitly asked for a placeholder screen only ("Authentication is coming in the next sprint") — `/login` is a static page with no form, no session, no credential handling of any kind.
- **Separate marketing routes for `/product`, `/platform`, `/about`**. The ticket specifies one landing page with eight ordered sections; `MarketingHeader`'s nav items are same-page anchors, not a multi-page site.
