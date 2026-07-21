# templates/RETROSPECTIVE.md

> **Forge – AI Engineering Framework**
>
> **Template:** Sprint Retrospective
>
> **Version:** 1.0.0
>
> **Status:** Stable
>
> **Classification:** Internal

---

# RETROSPECTIVE

This document captures the lessons learned after completing a sprint, release, or significant project milestone.

Its purpose is continuous improvement through objective analysis of outcomes, decisions, processes, and engineering practices.

Retrospectives focus on improving the system, not assigning blame.

---

# Project Information

| Field | Value |
|--------|-------|
| Project | {{PROJECT_NAME}} |
| Sprint / Release | {{ITERATION}} |
| Version | {{VERSION}} |
| Retrospective Date | {{DATE}} |
| Facilitator | {{FACILITATOR}} |
| Participants | {{PARTICIPANTS}} |

---

# Executive Summary

Provide a concise summary of the iteration.

{{SUMMARY}}

---

# Sprint Goal

Describe the original objective.

{{SPRINT_OBJECTIVE}}

---

# Outcome

Was the objective achieved?

- ☐ Fully Achieved
- ☐ Partially Achieved
- ☐ Not Achieved

Explanation:

{{OUTCOME}}

---

# Achievements

Identify what went well.

- {{ACHIEVEMENT}}
- {{ACHIEVEMENT}}
- {{ACHIEVEMENT}}

---

# Challenges

Identify significant issues encountered.

- {{CHALLENGE}}
- {{CHALLENGE}}
- {{CHALLENGE}}

---

# Root Cause Analysis

| Issue | Root Cause | Evidence |
|-------|------------|----------|
| {{ISSUE}} | {{CAUSE}} | {{EVIDENCE}} |
| {{ISSUE}} | {{CAUSE}} | {{EVIDENCE}} |

---

# What Worked Well

Examples:

- Effective planning
- Clear requirements
- Stable architecture
- High test coverage
- Good collaboration

Project-specific observations:

- {{OBSERVATION}}
- {{OBSERVATION}}
- {{OBSERVATION}}

---

# What Did Not Work Well

Examples:

- Poor estimation
- Missing documentation
- Technical debt
- Unclear requirements
- Delayed reviews

Project-specific observations:

- {{OBSERVATION}}
- {{OBSERVATION}}
- {{OBSERVATION}}

---

# Metrics Review

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Sprint Goal Completion | {{TARGET}} | {{ACTUAL}} | 🟢 / 🟡 / 🔴 |
| Planned Tasks Completed | {{TARGET}} | {{ACTUAL}} | 🟢 / 🟡 / 🔴 |
| Defects Introduced | {{TARGET}} | {{ACTUAL}} | 🟢 / 🟡 / 🔴 |
| Documentation Updated | Yes | {{ACTUAL}} | 🟢 / 🟡 / 🔴 |
| Architecture Compliance | 100% | {{ACTUAL}} | 🟢 / 🟡 / 🔴 |

---

# Technical Debt

## New Technical Debt

- {{ITEM}}
- {{ITEM}}

---

## Resolved Technical Debt

- {{ITEM}}
- {{ITEM}}

---

## Deferred Technical Debt

- {{ITEM}}
- {{ITEM}}

---

# Architecture Review

Did implementation remain aligned with the architecture?

- ☐ Yes
- ☐ No

Explanation:

{{ARCHITECTURE_REVIEW}}

---

# Documentation Review

Were all required documents updated?

- [ ] PROJECT_BLUEPRINT.md
- [ ] CURRENT_STATE.md
- [ ] ARCHITECTURE.md
- [ ] CHANGELOG.md
- [ ] DECISION_LOG.md
- [ ] NEXT_SPRINT.md

Notes:

{{DOCUMENTATION_NOTES}}

---

# Risks Identified

| Risk | Impact | Proposed Action |
|------|---------|-----------------|
| {{RISK}} | High / Medium / Low | {{ACTION}} |
| {{RISK}} | High / Medium / Low | {{ACTION}} |

---

# Lessons Learned

## Engineering

- {{LESSON}}
- {{LESSON}}

---

## Architecture

- {{LESSON}}
- {{LESSON}}

---

## Process

- {{LESSON}}
- {{LESSON}}

---

## Communication

- {{LESSON}}
- {{LESSON}}

---

# Improvement Actions

| Priority | Action | Owner | Target Sprint |
|----------|--------|-------|---------------|
| High | {{ACTION}} | {{OWNER}} | {{SPRINT}} |
| Medium | {{ACTION}} | {{OWNER}} | {{SPRINT}} |
| Low | {{ACTION}} | {{OWNER}} | {{SPRINT}} |

---

# Decisions Requiring Follow-up

Reference any ADRs that should be created or updated.

- ADR-{{NUMBER}}
- ADR-{{NUMBER}}

---

# Recommendations for the Next Sprint

- {{RECOMMENDATION}}
- {{RECOMMENDATION}}
- {{RECOMMENDATION}}

---

# Overall Assessment

Overall iteration health:

- ☐ Excellent
- ☐ Good
- ☐ Acceptable
- ☐ Needs Improvement
- ☐ Critical

Comments:

{{OVERALL_ASSESSMENT}}

---

# References

- PROJECT_BLUEPRINT.md
- CURRENT_STATE.md
- ARCHITECTURE.md
- CHANGELOG.md
- DECISION_LOG.md
- NEXT_SPRINT.md

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | {{DATE}} | Initial retrospective template |

---

# End of Document