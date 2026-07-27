# Score Calibration Report

**Phase**: F10-S02D — Score Validation
**Date**: 2026-07-27
**Scope**: Benchmark the deterministic Score Engine (`F10-S02B`/`F10-S02C`) against six real, unmodified websites. Report only — no Rule, Heuristic, or weighting code was changed to produce this document. See `docs/04_PROJECT/DECISION_LOG.md#cto-097`.

## Methodology

Six real `POST /audits` runs against a locally started API (`pnpm --filter @ai-visibility/database run migrate:deploy`, `pnpm --filter @ai-visibility/api run start:prod`), no seeding, no mocking, no AI provider involved — the same deterministic pipeline validated in `F10-S02B`/`F10-S02C`. Every figure below is copied directly from the real audit responses (`scores`, `analysis.findings`, `optimizationPlan.items`, `crawl`, `discovery`, `inventory`); nothing here is estimated or reconstructed after the fact.

Targets: `example.com`, `github.com`, `wikipedia.org`, `openai.com`, `developer.mozilla.org`, `cloudflare.com`.

## Per-Site Results

### example.com

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 46 | 25 | 0 (incomplete) | 50 | 0 (incomplete) | 100 | 100 (incomplete) |

**Findings**: `seo-metadata-quality` fail (title too-short, 14 chars; description missing) · `seo-heading-structure` pass · `seo-content-depth` fail (19 words, thin) · `seo-image-accessibility` pass (no images) · `seo-structured-data` fail (none) · `seo-indexability` pass · `seo-security-posture` pass · `seo-technical-foundation` fail (no robots.txt, no sitemap) · `seo-performance-estimate` pass (100) · `seo-internal-linking` fail (0 links) · `ai-visibility-readiness` fail (needs-improvement)

**Recommendations**: Fix missing/poorly-sized title and meta description · Expand thin page content · Add structured data and social preview tags · Add robots.txt/sitemap.xml and shorten long URLs · Add internal links to this page · Improve AI Visibility readiness

### github.com

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 79 | 75 | 100 (incomplete) | 50 | 100 (incomplete) | 50 | 100 (incomplete) |

**Findings**: `seo-metadata-quality` fail (title too-long, 61 chars; description too-long, 186 chars) · `seo-heading-structure` fail (4 × H1) · `seo-content-depth` pass (1,194 words) · `seo-image-accessibility` pass · `seo-structured-data` pass (partial: OG+Twitter, no JSON-LD) · `seo-indexability` pass · `seo-security-posture` pass · `seo-technical-foundation` fail (robots.txt present, sitemap not detected) · `seo-performance-estimate` pass (estimated 55, LCP/CLS/INP all "high" risk) · `seo-internal-linking` pass (107 links) · `ai-visibility-readiness` pass (ready)

**Recommendations**: Fix missing/poorly-sized title and meta description · Fix heading structure · Add robots.txt/sitemap.xml and shorten long URLs

### wikipedia.org

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 58 | 50 | 0 (incomplete) | 50 | 100 (incomplete) | 50 | 100 (incomplete) |

**Findings**: `seo-metadata-quality` fail (title too-short, 9 chars: "Wikipedia"; description ok) · `seo-heading-structure` pass · `seo-content-depth` pass (867 words) · `seo-image-accessibility` fail (1/1 image missing alt) · `seo-structured-data` pass (partial: OG only) · `seo-indexability` pass · `seo-security-posture` pass · `seo-technical-foundation` fail (robots.txt present, sitemap not detected) · `seo-performance-estimate` pass (estimated 70) · `seo-internal-linking` fail (0 links; redirected to `www.wikipedia.org`, all 374 outbound links point to other-language subdomains) · `ai-visibility-readiness` fail (needs-improvement, relationshipCoverage none)

**Recommendations**: Fix missing/poorly-sized title and meta description · Add missing image alt text · Add robots.txt/sitemap.xml and shorten long URLs · Add internal links to this page · Improve AI Visibility readiness

### openai.com — ⚠ crawl blocked, results not representative of the real site

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 42 | 0 | 0 (incomplete) | 100 | 0 (incomplete) | 50 | 100 (incomplete) |

The crawl received **HTTP 403** (`crawl.httpStatus: 403`, `crawl.success: false`, 9,680-byte response — a bot-protection challenge page, not the real homepage; `inventory.title: null`). The Crawler Engine sends no custom `User-Agent` header (`services/crawler/src/crawler-engine.ts`), which is the most likely reason a WAF in front of openai.com rejected the request. Every downstream Finding for this site (missing title/description, 6-word "thin" content, zero H1s, zero structured data, zero internal links, indexability blocker, "not-ready" AI visibility) is a direct consequence of auditing an error page, not the real openai.com. **This result is excluded from the calibration analysis below** — it is evidence about crawler bot-resilience, not about Rule calibration, and is called out separately in "Non-Calibration Finding" below.

**Findings** (for completeness, not used for calibration): `seo-metadata-quality` fail (missing) · `seo-heading-structure` fail (0 × H1) · `seo-content-depth` fail (6 words) · `seo-image-accessibility` pass (no images) · `seo-structured-data` fail (none) · `seo-indexability` fail (non-2xx-http-status) · `seo-security-posture` pass · `seo-technical-foundation` pass · `seo-performance-estimate` pass · `seo-internal-linking` fail (0 links) · `ai-visibility-readiness` fail (not-ready)

**Recommendations**: Fix missing/poorly-sized title and meta description · Fix heading structure · Expand thin page content · Add structured data and social preview tags · Remove indexability blockers · Add internal links to this page · Improve AI Visibility readiness

### developer.mozilla.org

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 96 | 75 | 100 (incomplete) | 100 | 100 (incomplete) | 100 | 100 (incomplete) |

**Findings**: `seo-metadata-quality` fail (title too-short, 12 chars: "MDN Web Docs"; description ok) · `seo-heading-structure` pass · `seo-content-depth` pass (1,127 words) · `seo-image-accessibility` pass · `seo-structured-data` pass (partial: Twitter only) · `seo-indexability` pass · `seo-security-posture` pass · `seo-technical-foundation` pass (robots.txt + sitemap both detected) · `seo-performance-estimate` pass (estimated 75) · `seo-internal-linking` pass (133 links) · `ai-visibility-readiness` pass (ready)

**Recommendations**: Fix missing/poorly-sized title and meta description

### cloudflare.com

| Overall | SEO | AI Visibility | Technical | Content | Accessibility | Performance |
|---|---|---|---|---|---|---|
| 88 | 75 | 100 (incomplete) | 100 | 100 (incomplete) | 50 | 100 (incomplete) |

**Findings**: `seo-metadata-quality` fail (title ok, 35 chars; description too-short, 68 chars) · `seo-heading-structure` fail (2 × H1, hierarchy invalid) · `seo-content-depth` pass (1,243 words) · `seo-image-accessibility` pass (66 images, 65 missing width/height dimensions, alt coverage still "good") · `seo-structured-data` pass (full: JSON-LD + OG + Twitter) · `seo-indexability` pass · `seo-security-posture` pass · `seo-technical-foundation` pass · `seo-performance-estimate` pass (estimated 60, LCP/CLS "high" risk) · `seo-internal-linking` pass (53 links) · `ai-visibility-readiness` pass (ready)

**Recommendations**: Fix missing/poorly-sized title and meta description · Fix heading structure

---

## Calibration Findings

Five real websites (`example.com`, `github.com`, `wikipedia.org`, `developer.mozilla.org`, `cloudflare.com`) are used for calibration below. `openai.com` is excluded — see "Non-Calibration Finding" at the end.

### 1. `seo-metadata-quality` is miscalibrated — too strict (false positive on 4 of 5 real sites)

**Evidence**: Failed on **every one of the five** valid sites, including three of the most authoritative, professionally-maintained homepages on the internet:
- Wikipedia: title = `"Wikipedia"` (9 chars) — deliberately a single-word brand title. Flagged `too-short` (band requires 30–60).
- MDN: title = `"MDN Web Docs"` (12 chars) — same pattern. Flagged `too-short`.
- GitHub: title 61 chars (band max 60) and description 186 chars (band max 160) — fails by 1 and 26 characters respectively, against a title that is clearly hand-written, deliberate marketing copy.
- Cloudflare: description 68 chars (band min 70) — fails by 2 characters.
- example.com is the one genuine true positive here (no description at all).

**Diagnosis**: `services/heuristics/src/combinators/metadata-quality.ts`'s hard character-count bands (title 30–60, description 70–160), combined with `services/analysis/src/rules/heuristics/metadata-quality.rule.ts` requiring **both** title and description to land `'ok'` to pass, produces a rule that fails almost every real homepage — including ones with obviously deliberate, well-considered titles. A single-word, globally-recognized brand title (Wikipedia, MDN) is not an SEO defect; nor is missing a 160-character cutoff by 2 characters.

**Classification**: Rule too strict / calibration issue (not a detection bug — the underlying title/description text captured by the `metadata` analyzer is correct in every case).

### 2. `seo-technical-foundation`'s sitemap check has a false-negative detection bug, root-caused

**Evidence**: GitHub and Wikipedia both show `hasSitemap: false` despite `hasRobotsTxt: true`. Manually verified live: `curl -sI https://github.com/sitemap.xml` returns **HTTP 406** (not 404 — a sitemap resource genuinely exists at that path; the request is merely rejected for lacking an acceptable `Accept` header).

**Root cause, at the code level**: `services/discovery/src/detect-resource.ts`:
```
const headResponse = await fetch(url, { method: 'HEAD', redirect: 'follow' });
if (headResponse.ok) return true;
if (headResponse.status === 405) { /* retry with GET */ }
return false;
```
Only a `405` triggers a GET retry; every other non-2xx status (406, 403, etc.) is treated identically to "resource does not exist," even though a 406 is direct proof the resource exists and is merely content-negotiation-picky.

**Classification**: False negative / signal-detection bug, not a Rule-weighting issue — no threshold adjustment can fix this; it needs a broader retry/acceptance condition in `detectResource`.

### 3. `seo-internal-linking` has a false-negative on Wikipedia caused by subdomain misclassification

**Evidence**: `wikipedia.org` redirects to `https://www.wikipedia.org/` and reports `internalLinkCount: 0, externalLinkCount: 374`. The 374 outbound links are almost certainly the site's per-language links (`en.wikipedia.org`, `de.wikipedia.org`, `fr.wikipedia.org`, …) — every one a different subdomain of the same brand and registrable domain, yet counted as "external."

**Diagnosis**: the internal/external link classifier (inventory engine) most plausibly compares the exact hostname rather than the registrable domain (eTLD+1). Wikipedia's homepage is not link-poor; the classifier cannot see links to sibling subdomains as "internal."

**Classification**: False negative / signal-detection issue, not a Rule-weighting issue.

### 4. `seo-performance-estimate` is too permissive — the Rule never fails on real sites, even when its own risk estimate says "high"

**Evidence**: `MINIMUM_ACCEPTABLE_SCORE = 50` (`services/analysis/src/rules/heuristics/performance-estimate.rule.ts`) passed on **5 of 5** real sites, including GitHub (`estimatedPerformanceScore: 55`, LCP/CLS/INP **all** flagged `"high"` risk) and Cloudflare (`estimatedPerformanceScore: 60`, LCP/CLS `"high"` risk). A rule that passes a site its own heuristic scores as having "high" Core Web Vitals risk on every dimension is not discriminating between good and bad performance — it is only catching sites that are almost totally unoptimized.

**Compounding effect**: `performance` is a single-Rule category (`F10-S02B`), so this one lenient threshold is the *entire* Performance category score for every audited site — every site in this benchmark scored Performance 100, regardless of real, self-reported "high" Core Web Vitals risk.

**Classification**: Rule too permissive / calibration issue — a direct weight/threshold fix is possible (see recommendations).

### 5. `seo-structured-data`'s "any one of three" pass bar is too permissive for this product's own mission

**Evidence**: MDN passes with **only** a Twitter Card tag (no OpenGraph, no JSON-LD). GitHub passes with OpenGraph + Twitter but **no JSON-LD**. Only Cloudflare has genuine full coverage (JSON-LD + OG + Twitter).

**Diagnosis**: `services/heuristics/src/combinators/structured-data-coverage.ts` treats presence of JSON-LD, OpenGraph, and Twitter Card as interchangeable — any one present and the check passes (`coverageBand !== 'none'`). For an "AI Visibility Auditor," JSON-LD is the most consequential of the three (it is what LLM/AI crawlers and rich-result systems parse most reliably); Twitter Card alone materially under-represents AI-visibility structured-data readiness relative to what the score implies.

**Classification**: Rule too permissive / calibration issue.

### 6. `seo-heading-structure`'s single-H1 requirement produces borderline failures on modern, component-driven sites

**Evidence**: GitHub (4 × H1) and Cloudflare (2 × H1, plus a hierarchy skip) both fail outright. Multiple `<h1>` elements scoped to separate HTML5 sectioning elements is common in modern component-driven markup and is not a WCAG violation in itself (WCAG does not mandate exactly one H1 per document; "one H1" is a historical SEO convention, not an accessibility requirement) — though Cloudflare's additional hierarchy skip is a more defensible real issue.

**Classification**: Borderline / worth re-scoping, not a clear-cut false positive — recommend investigating whether the heading-hierarchy analyzer is section-scoped or document-scoped before changing anything.

### 7. Missing image dimensions is a real, widely-present defect that never surfaces as its own Finding (false negative by omission)

**Evidence**: GitHub — 24 of 24 images missing width/height. Cloudflare — 65 of 66. Both still score `"good"` on `seo-image-accessibility` (which only weighs `missingAltCount`), and the same `missingDimensionsCount` only ever feeds `performance-estimate`'s internal CLS-risk estimate (see Finding 4) — which the Rule's binary pass/fail throws away.

**Classification**: False negative by omission — a real, measured, widely-present defect (missing image dimensions → real CLS risk) is captured in Signal data but has no Rule of its own and cannot cause a category to fail.

### 8. `ai-visibility-readiness` reflects single-homepage entity/relationship density, not real brand-level AI visibility — a methodology limit, not a weight problem

**Evidence**: Wikipedia — one of the most well-structured, well-known entities on the internet — scores `needs-improvement` (`relationshipCoverage: 'none'`) purely because its minimal language-portal homepage doesn't itself contain extractable entity relationships.

**Classification**: Scope/methodology limitation. No weight or threshold adjustment fixes this — the Rule is accurately describing what the single audited page's Knowledge Graph looks like; the gap is between "this page's Knowledge Graph" and "this brand's real AI visibility," which is a data-scope question (multi-page crawling, `docs/03_PRODUCT/FUTURE_ROADMAP.md`'s existing "Heuristic Analysis" deferred-ideas note on single-page-only auditing) rather than something a weight can correct.

### Reconfirms a prior, already-deferred finding: equal category/rule weighting amplifies thin categories

Cloudflare (Overall 88) and MDN (Overall 96) are both strong sites whose Overall score is measurably dragged by a single 1-of-2 (`accessibility`, Cloudflare) or 1-of-1 (every single-Rule category) Rule outcome — the same unweighted-average design `F10-S02A`'s P4 finding and `docs/03_PRODUCT/FUTURE_ROADMAP.md`'s "Real Scoring Engine" deferred-ideas entry already named. This benchmark reconfirms it with real cross-site data rather than introducing a new finding.

## Non-Calibration Finding: crawler bot-resilience

`openai.com` returned HTTP 403 to this audit's crawl request. The Crawler Engine (`services/crawler/src/crawler-engine.ts`) sends no custom `User-Agent` header, which is a plausible trigger for WAF/bot-protection challenge pages on sites that gate default HTTP-client user agents. This is not a Rule-calibration issue — every downstream Finding for a blocked crawl is expected to look catastrophic, correctly reflecting "we couldn't read this page," not "this page is bad." Recommend treating a non-2xx crawl as its own distinct, clearly-labeled audit outcome (not indistinguishable from a real, fully-crawled, badly-optimized page) in a future ticket — out of scope for this report to implement.

## Recommended Adjustments (recommendations only — nothing below was applied)

**Signal-detection bug fixes** (not weight changes — these produce false negatives regardless of any threshold):
- `detectResource()` (`services/discovery/src/detect-resource.ts`): accept a broader set of "resource exists" responses (e.g., retry with GET on any 4xx that isn't 404, or always fall back to GET when HEAD isn't a clean 2xx) so a real sitemap behind content-negotiation (406) or bot-protection isn't reported as absent.
- Internal/external link classification (inventory engine): classify by registrable domain (eTLD+1), not exact hostname, so same-brand subdomains (`en.wikipedia.org` from `www.wikipedia.org`) count as internal.

**Threshold/weight calibration** (adjustable via existing constants, no structural change):
- `metadata-quality` combinator (`services/heuristics/src/combinators/metadata-quality.ts`): widen the title/description bands (e.g. title 10–60, description 50–160) and/or change the Rule from "both must be `'ok'`" to a graduated pass/warning/fail so a single short-but-deliberate brand title doesn't fail the same way as a genuinely missing title.
- `performance-estimate.rule.ts`'s `MINIMUM_ACCEPTABLE_SCORE`: raise above 50, or add an explicit fail condition when any `coreWebVitalsEstimate` dimension is `"high"` risk, so the Rule can actually fail a real, unoptimized site instead of passing every real site benchmarked here.
- `structured-data-coverage` combinator: weight JSON-LD presence above OpenGraph/Twitter Card rather than treating "any one of three" as sufficient for a full pass.
- `heading-structure-quality` combinator: consider scoping "single H1" per sectioning root rather than per document, or downgrade a bare multiple-H1 count (no hierarchy skip) to a warning-level outcome distinct from a genuine hierarchy skip.

**Not fixable by weight adjustment** (named so they aren't mistaken for tuning problems):
- `ai-visibility-readiness`'s dependence on single-homepage entity/relationship extraction (Finding 8) — a data-scope limitation, tracked in `docs/03_PRODUCT/FUTURE_ROADMAP.md`.
- Missing-image-dimensions visibility (Finding 7) needs a new Rule/Finding of its own, not a threshold change to an existing one.
- Category/rule weighting (P4, `F10-S02A`) — already an open, deferred recommendation; this benchmark reconfirms rather than newly identifies it.
