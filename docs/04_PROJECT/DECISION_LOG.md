# Purpose

To record significant technical decisions made during implementation, why they were made, and what alternative was rejected. This is a historical record, not a standard — it explains the reasoning behind decisions already reflected in `docs/01_ARCHITECTURE/` and `docs/04_PROJECT/CURRENT_STATE.md`, it does not itself impose new rules.

# CTO-059

**Title**: Client as the top-level aggregate above Project
**Sprint**: F6-S01
**Decision**: Introduce a `Client` aggregate as the top-level business entity. Every `Project` belongs to exactly one `Client` (required foreign key). The workspace hierarchy becomes `Client → Project → Audit`.

**Why**: The platform is used by agencies managing several customers at once. Without a Client aggregate, every Project was an unowned, flat entity with no way to group the Projects belonging to the same customer.

**How it preserves existing behavior**: `POST /audits { url }` still works with no new required field. When a Project is auto-provisioned from a URL and no `clientId` is supplied, a Client is auto-provisioned the same way Projects were auto-provisioned from a URL in `F4-S01` (find-or-create by primary domain, industry defaulted to `"unknown"`). Passing an explicit `clientId` on `POST /audits`, or creating a Client explicitly via `POST /clients`, lets several Projects share one Client — the actual multi-customer capability this decision exists to enable.

**Rejected alternative**: Requiring `clientId` on every `POST /audits` call. Rejected because it would break the existing audit-creation contract for no benefit to single-customer usage, contradicting the Discovery Protocol's rule to prioritize backward compatibility.

**Scope boundary**: Contacts, billing, organizations, teams, and permissions were explicitly out of scope for this decision and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.

# CTO-061

**Title**: Executive Dashboard as a pure Read Model composition
**Sprint**: F6-S02
**Decision**: Implement the Executive Dashboard as an application-layer composition (`ExecutiveDashboardQueryService`) that reads exclusively from existing Read Models — the Project, Client, and Audit repositories; the Finding, AI Visibility, and Baseline History read repositories already established in `F3-S05`, `F4-S02`, and `F4-S03`; and the existing recommendation-derivation function (`generateRecommendations`, `F2-S14`). It persists nothing new and adds no new endpoint on any Business Engine.

**Why**: The objective requires an "immediate understanding" view without executing business logic or querying Business Engines directly. Composing already-computed Read Model data is the only approach consistent with both constraints, and reusing `generateRecommendations` avoids a second, divergent implementation of recommendation priority.

**Score trend, effort, and improvement labels**: `AiVisibilityAssessment` only ever stored a categorical status (`ready` / `needs-improvement` / `not-ready`) — no numeric score exists anywhere in the domain model. "AI Visibility Score" on the Dashboard is that same categorical value; "Score Trend" is a fixed three-value ordinal comparison of current vs. Baseline, reusing the same comparison approach already used by the Audit Comparison Service (`F4-S03`). "Estimated Effort" and "Expected Improvement" on each Priority Action are simple deterministic labels derived from data already on the Recommendation (related finding count, and the same priority `generateRecommendations` already assigns) — not a new scoring formula.

**Rejected alternative**: Computing a new numeric AI Visibility score. Rejected because no such score exists anywhere in the domain model; introducing one would be new business logic invented outside a Read Model, which the objective explicitly forbids.

**Scope boundary**: Charts, filters, PDF export, dashboard widget customization, and a multi-project dashboard view were explicitly out of scope and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.

# CTO-062

**Title**: Recommendation Engine as an application-layer projection with a deterministic prioritization model
**Sprint**: F6-S03
**Decision**: Formalize recommendation generation as `apps/api/src/application/recommendation/` — `generateRecommendations` (a projection: Findings + Project/Audit context → `Recommendation[]`) and `recommendation-prioritization.ts` (the prioritization model). Moved from `presentation/audit/recommendation.service.ts`, where it originated as a single-consumer helper (`F2-S14`); now that both the Audit response (`audit-summary.view.ts`) and the Executive Dashboard (`F6-S02`) consume it, application layer is the correct home — presentation-layer code never depended on it in the wrong direction. `Recommendation` gained `description`, `expectedImpact`, `estimatedEffort`, `projectId`, and `auditId`; the Dashboard's separate `DashboardPriorityAction` type and its own effort/impact heuristics (`F6-S02`) were deleted and replaced by reusing `Recommendation` and the prioritization model directly — one prioritization model, not two.

**Prioritization model**: Priority is a deterministic composite of three inputs, each a `low`/`medium`/`high` level:
- **Expected impact** — derived from the Audit's overall `AiVisibilityAssessment.status` (`not-ready` → high, `needs-improvement` → medium, `ready` → low), the same signal `F6-S02`'s Dashboard already used for its own priority derivation.
- **Estimated effort** — derived from the count of Findings a Recommendation groups (1 → low, 2–3 → medium, 4+ → high).
- **Confidence** — currently always `high`: the Rule Engine only ever returns a definitive pass/fail outcome, never a partial or uncertain one, so there is no real signal to differentiate confidence today. The prioritization model still takes it as an explicit input so a future Rule Engine capable of partial/uncertain outcomes needs no redesign here.

These three levels are scored and combined (impact weighted highest, low-effort "quick wins" favored) into `priority`. Recommendations remain projections: nothing is persisted, and everything is recomputed from Findings and Project/Audit context on every read.

**Why not expose Confidence as a field**: the acceptance criteria list the Recommendation fields to expose (Title, Description, Business rationale, Expected impact, Estimated effort, Priority, Related Findings); Confidence is named only as a prioritization input, not a field to display, so it stays internal to the model rather than adding contract surface nothing asked to see.

**Rejected alternative**: Differentiating Estimated Effort or Confidence by Finding category or source engine. Rejected because no such taxonomy exists anywhere in the domain model — inventing one would be fabricating data not actually produced by any Business Engine.

**Scope boundary**: AI-generated text, task management, recommendation history, and a recommendation approval workflow were explicitly out of scope and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.
