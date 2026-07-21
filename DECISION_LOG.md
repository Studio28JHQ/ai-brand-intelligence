# templates/DECISION_LOG.md

> **Forge – AI Engineering Framework**
>
> **Template:** Decision Log
>
> **Version:** 1.0.0
>
> **Status:** Stable
>
> **Classification:** Internal

---

# DECISION LOG

This document records all significant engineering decisions made throughout the lifecycle of the project.

Its purpose is to preserve architectural rationale, provide historical traceability, and reduce future uncertainty.

Every important decision must be documented before implementation.

---

# Project Information

| Field | Value |
|--------|-------|
| Project | {{PROJECT_NAME}} |
| Version | {{VERSION}} |
| Last Updated | {{LAST_UPDATED}} |
| Maintained By | {{OWNER}} |

---

# Decision Status Legend

| Status | Meaning |
|--------|---------|
| Proposed | Under evaluation |
| Accepted | Approved and implemented |
| Rejected | Considered but discarded |
| Superseded | Replaced by another decision |
| Deprecated | Scheduled for removal |

---

# Decision Index

| ID | Title | Date | Status |
|----|-------|------|--------|
| ADR-001 | {{TITLE}} | {{DATE}} | Accepted |
| ADR-002 | {{TITLE}} | {{DATE}} | Proposed |
| ADR-003 | {{TITLE}} | {{DATE}} | Rejected |

---

# Decision Template

---

# ADR-{{NUMBER}}

## Title

{{TITLE}}

---

## Status

Proposed / Accepted / Rejected / Superseded / Deprecated

---

## Date

{{DATE}}

---

## Authors

{{AUTHOR}}

---

## Context

Describe the situation that requires a decision.

Include:

- business context,
- technical context,
- existing limitations,
- constraints,
- assumptions.

{{CONTEXT}}

---

## Problem Statement

Clearly define the problem to solve.

{{PROBLEM}}

---

## Decision

Describe the selected solution.

{{DECISION}}

---

## Alternatives Considered

### Alternative A

Description:

{{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}
- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}
- {{DISADVANTAGE}}

---

### Alternative B

Description:

{{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}

---

### Alternative C

Description:

{{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}

---

## Consequences

### Positive

- {{BENEFIT}}
- {{BENEFIT}}
- {{BENEFIT}}

---

### Negative

- {{DRAWBACK}}
- {{DRAWBACK}}

---

### Risks

- {{RISK}}
- {{RISK}}

---

## Impact

### Business

{{BUSINESS_IMPACT}}

---

### Architecture

{{ARCHITECTURE_IMPACT}}

---

### Development

{{DEVELOPMENT_IMPACT}}

---

### Operations

{{OPERATIONS_IMPACT}}

---

## Dependencies

- {{DEPENDENCY}}
- {{DEPENDENCY}}

---

## Related Decisions

- ADR-{{NUMBER}}
- ADR-{{NUMBER}}

---

## Implementation Notes

{{IMPLEMENTATION}}

---

## Validation

How will this decision be validated?

- {{VALIDATION}}
- {{VALIDATION}}

---

## Rollback Strategy

If the decision proves incorrect:

{{ROLLBACK}}

---

## References

- PROJECT_BLUEPRINT.md
- ARCHITECTURE.md
- CURRENT_STATE.md
- CHANGELOG.md
- NEXT_SPRINT.md

Additional references:

- {{REFERENCE}}

---

## Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | {{DATE}} | Initial decision |

---

# Decision Guidelines

A decision should be documented when it:

- changes the architecture,
- changes project direction,
- introduces external dependencies,
- modifies security,
- changes infrastructure,
- affects scalability,
- impacts maintainability,
- introduces significant technical debt,
- changes operational behavior.

Routine implementation details should **not** become ADRs.

---

# Writing Principles

Every decision should:

- explain **why**, not only **what**,
- be understandable years later,
- avoid unnecessary implementation details,
- include rejected alternatives,
- be independently readable.

---

# Traceability

Whenever possible, each ADR should reference:

- business goals,
- functional requirements,
- architecture sections,
- sprint implementations,
- changelog entries.

This ensures complete engineering traceability.

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | {{DATE}} | Initial Decision Log template |

---

# End of Document