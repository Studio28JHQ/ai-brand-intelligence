# Purpose

To record how the AI Consultant became proactive (`F10-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-079`) — what it surfaces unprompted, where that data comes from, and how a Recommendation's lifecycle works. This is a reference document, not a standard with its own approval process. It builds directly on the AI Daily Briefing (`F7-S04`) and does not repeat that document's category/prioritization detail (`CURRENT_STATE.md#ai-daily-briefing`).

# Proactive Behavior

Before this sprint, the AI Consultant (`F7-S03`) was purely reactive: it answered a typed question, or nothing. `apps/web/app/projects/[id]/consultant/page.tsx` now renders a new `ProactiveRecommendations` component (`apps/web/app/projects/[id]/consultant/proactive-recommendations.tsx`) above the existing `ConsultantChat`, so the page shows unprompted insights first and still answers questions below — "Existing functionality preserved" is satisfied because `ConsultantChat` itself is untouched.

**No new insight-generation logic was written.** `ProactiveRecommendations` calls the same `GET /briefing/daily` the AI Daily Briefing already exposes (`getDailyBriefing()`, `apps/web/app/actions.ts`), filters the returned `BriefingItem[]` to `item.projectId === projectId`, and keeps the order the Briefing already prioritized them in (`sortBriefingItems`, `F7-S04`) — filtering a sorted array preserves relative order, so no re-sorting is needed. This is why the ticket's "No new business capabilities introduced" and "Do not redesign the AI architecture" are satisfied by construction: zero `apps/api` changes were made for this sprint.

**Category → section relabeling** (`apps/web/app/lib/recommendation-groups.ts`, `groupRecommendationsBySection`), a pure presentation-layer mapping from the Briefing's six existing `BriefingItemCategory` values to the five section labels this ticket's TASKS names:

| Briefing category | Recommendation section |
|---|---|
| `project-attention`, `critical-finding` | High-Priority Alerts |
| `ai-visibility-regression` | Risk Notifications |
| `campaign-awaiting-verification` | Verification Reminders |
| `high-impact-opportunity` | Optimization Opportunities |
| `recent-improvement` | Daily Highlights |

**Executive summary**: one templated sentence (`buildExecutiveSummary`, same file) counting the visible items per section — e.g. "Acme Digital has 4 open recommendations: 1 verification reminders, 3 daily highlights." — computed purely from counts of already-known items, the same deterministic-templating discipline every AI-facing feature in this codebase has used since `F6-S07` (no LLM, no invented text).

**Every recommendation carries the four fields the ticket requires**, all reused verbatim from the existing `BriefingItem` shape (`packages/contracts/src/ai-briefing.ts`) — no new contract was introduced:

- **Why** → `item.reason`
- **Evidence** → `item.evidence` (rendered in a collapsed "Evidence" `<details>`, same pattern `DailyBriefing`/`ConsultantChat`/the Executive Client Report already use)
- **Expected impact** → `item.businessImpact`
- **Recommended action** → `item.recommendedNextAction`

# Recommendation Lifecycle

1. **Generated fresh on every page load** — recommendations are never persisted server-side, mirroring the Daily Briefing (`F7-S04`) and Consultant Chat (`F7-S03`, "Do not implement: Long-term memory"). There is no "recommendation" database row anywhere; a Recommendation is a `BriefingItem` viewed through this page.
2. **Dismissed client-side only** — clicking "Dismiss" adds the item's `id` to a `Set` kept in `localStorage` under `dismissed-recommendations:{projectId}` (`apps/web/app/projects/[id]/consultant/proactive-recommendations.tsx`). No new API endpoint or database table was added for dismissal state, which would have been a genuinely new business capability; a browser-local dismissal list is presentation-layer state, consistent with the Chat's own "no long-term memory" precedent, just scoped to "this browser" instead of "this render."
3. **Dismissal is evidence-scoped, not id-arbitrary** — a `BriefingItem.id` is deterministic from the Project, category, and the specific record driving it (`${projectId}:${category}:${idSuffix}`, `F7-S04`'s `makeItem`). If the underlying evidence changes (a new Audit runs, a Campaign advances), the `idSuffix` changes and a new, un-dismissed item appears with its own fresh evidence — dismissing "this alert" never silently suppresses a materially different future alert that happens to share a title.
4. **Reappears if evidence is regenerated identically** — dismissal is keyed by id, not by category, so if nothing about a Project changes between visits, a dismissed item stays dismissed; this is the intended "read once, don't nag again" behavior "dismissible" implies.

# Rejected Scope

- **A new `apps/api` recommendations endpoint or domain concept.** Rejected — the ticket explicitly forbids new business capabilities and architecture changes, and the AI Daily Briefing already computes every fact this sprint needed; adding a parallel endpoint would duplicate `AiDailyBriefingQueryService` for no new information.
- **Server-persisted dismissal state (a `dismissed_recommendations` table, a user/session concept).** Rejected as new business capability and, more fundamentally, this codebase has no authentication or user-account concept yet (`CTO-075`) to scope such a table to — `localStorage` is the only mechanism available that doesn't require inventing one.
- **An "Executive Summaries" section as a sixth Recommendation category distinct from the others.** The ticket lists "Executive summaries" alongside the other five proactive behaviors; implemented instead as the one-sentence rollup at the top of the Recommendations card (`buildExecutiveSummary`) rather than a seventh bucket of items, since an executive summary is a synthesis *of* the other recommendations, not a new kind of recommendation with its own Why/Evidence/Impact/Action.
- **Workspace-wide (cross-Project) proactive surfacing.** The AI Daily Briefing already covers the cross-Project view on the workspace home page; this sprint's proactive surface is intentionally Project-scoped, matching the AI Consultant's own existing scope (`projectId` route param) rather than duplicating the Briefing's workspace-wide page.
