# templates/ARCHITECTURE.md

> **Forge – AI Engineering Framework**
>
> **Template:** Architecture Document
>
> **Version:** 1.0.0
>
> **Status:** Stable
>
> **Classification:** Internal

---

# PROJECT INFORMATION

| Field | Value |
|--------|-------|
| Project | {{PROJECT_NAME}} |
| Version | {{VERSION}} |
| Architecture Version | {{ARCHITECTURE_VERSION}} |
| Architect | {{ARCHITECT}} |
| Last Updated | {{LAST_UPDATED}} |
| Status | {{STATUS}} |

---

# 1. Executive Summary

## Purpose

{{ARCHITECTURE_PURPOSE}}

---

## Architectural Vision

{{ARCHITECTURAL_VISION}}

---

## Scope

{{ARCHITECTURE_SCOPE}}

---

# 2. Architectural Principles

- {{PRINCIPLE_1}}
- {{PRINCIPLE_2}}
- {{PRINCIPLE_3}}
- {{PRINCIPLE_4}}
- {{PRINCIPLE_5}}

---

# 3. Quality Attributes

| Attribute | Target |
|-----------|--------|
| Availability | {{TARGET}} |
| Scalability | {{TARGET}} |
| Security | {{TARGET}} |
| Reliability | {{TARGET}} |
| Maintainability | {{TARGET}} |
| Performance | {{TARGET}} |
| Observability | {{TARGET}} |

---

# 4. System Context

## Description

{{SYSTEM_CONTEXT}}

---

## External Systems

| System | Purpose | Integration |
|---------|----------|-------------|
| {{SYSTEM}} | {{PURPOSE}} | {{TYPE}} |
| {{SYSTEM}} | {{PURPOSE}} | {{TYPE}} |

---

# 5. High-Level Architecture

## Components

| Component | Responsibility |
|-----------|----------------|
| {{COMPONENT}} | {{RESPONSIBILITY}} |
| {{COMPONENT}} | {{RESPONSIBILITY}} |
| {{COMPONENT}} | {{RESPONSIBILITY}} |

---

## Component Relationships

{{COMPONENT_RELATIONSHIPS}}

---

# 6. Application Layers

## Presentation Layer

{{DESCRIPTION}}

---

## Application Layer

{{DESCRIPTION}}

---

## Domain Layer

{{DESCRIPTION}}

---

## Infrastructure Layer

{{DESCRIPTION}}

---

# 7. Module Breakdown

## Module

### Name

{{MODULE_NAME}}

### Responsibility

{{RESPONSIBILITY}}

### Dependencies

- {{DEPENDENCY}}
- {{DEPENDENCY}}

### Interfaces

- {{INTERFACE}}

---

(Repeat as required.)

---

# 8. Data Architecture

## Primary Data Sources

| Source | Purpose |
|--------|----------|
| {{SOURCE}} | {{PURPOSE}} |
| {{SOURCE}} | {{PURPOSE}} |

---

## Core Entities

- {{ENTITY}}
- {{ENTITY}}
- {{ENTITY}}

---

## Data Ownership

| Entity | Owner |
|---------|-------|
| {{ENTITY}} | {{MODULE}} |
| {{ENTITY}} | {{MODULE}} |

---

# 9. API Architecture

## Internal APIs

| API | Purpose |
|-----|----------|
| {{API}} | {{PURPOSE}} |
| {{API}} | {{PURPOSE}} |

---

## External APIs

| API | Provider | Purpose |
|-----|----------|----------|
| {{API}} | {{PROVIDER}} | {{PURPOSE}} |
| {{API}} | {{PROVIDER}} | {{PURPOSE}} |

---

# 10. Security Architecture

## Authentication

{{AUTHENTICATION}}

---

## Authorization

{{AUTHORIZATION}}

---

## Secrets Management

{{SECRETS}}

---

## Encryption

{{ENCRYPTION}}

---

## Security Controls

- {{CONTROL}}
- {{CONTROL}}
- {{CONTROL}}

---

# 11. Infrastructure

## Runtime Environment

{{ENVIRONMENT}}

---

## Hosting

{{HOSTING}}

---

## Networking

{{NETWORK}}

---

## Storage

{{STORAGE}}

---

## CDN / Edge

{{EDGE}}

---

# 12. Deployment Architecture

## Deployment Strategy

{{DEPLOYMENT_STRATEGY}}

---

## Environments

| Environment | Purpose |
|------------|----------|
| Development | {{DESCRIPTION}} |
| Testing | {{DESCRIPTION}} |
| Staging | {{DESCRIPTION}} |
| Production | {{DESCRIPTION}} |

---

# 13. Scalability Strategy

## Horizontal Scaling

{{DESCRIPTION}}

---

## Vertical Scaling

{{DESCRIPTION}}

---

## Caching

{{DESCRIPTION}}

---

## Queueing

{{DESCRIPTION}}

---

# 14. Reliability

## Backup Strategy

{{DESCRIPTION}}

---

## Disaster Recovery

{{DESCRIPTION}}

---

## High Availability

{{DESCRIPTION}}

---

# 15. Monitoring

## Metrics

- {{METRIC}}
- {{METRIC}}
- {{METRIC}}

---

## Logging

{{DESCRIPTION}}

---

## Alerts

{{DESCRIPTION}}

---

## Dashboards

{{DESCRIPTION}}

---

# 16. Performance

## Targets

| Metric | Target |
|--------|--------|
| Response Time | {{TARGET}} |
| Throughput | {{TARGET}} |
| Error Rate | {{TARGET}} |
| Availability | {{TARGET}} |

---

# 17. Risks

| Risk | Impact | Mitigation |
|------|---------|------------|
| {{RISK}} | {{IMPACT}} | {{MITIGATION}} |
| {{RISK}} | {{IMPACT}} | {{MITIGATION}} |

---

# 18. Architectural Decisions

Reference all Architecture Decision Records (ADRs).

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | {{TITLE}} | Accepted |
| ADR-002 | {{TITLE}} | Accepted |

---

# 19. Known Limitations

- {{LIMITATION}}
- {{LIMITATION}}
- {{LIMITATION}}

---

# 20. Future Evolution

Potential architectural improvements intentionally deferred.

- {{IMPROVEMENT}}
- {{IMPROVEMENT}}
- {{IMPROVEMENT}}

---

# References

- PROJECT_BLUEPRINT.md
- CURRENT_STATE.md
- DECISION_LOG.md
- CHANGELOG.md
- NEXT_SPRINT.md

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | {{DATE}} | Initial architecture document |

---

# Approval

| Role | Name | Date |
|------|------|------|
| Solution Architect | {{NAME}} | {{DATE}} |
| Technical Lead | {{NAME}} | {{DATE}} |

---

# End of Document