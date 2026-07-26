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
