# Project Identity

AI Visibility Auditor. Governing definition: `docs/00_FOUNDATION/00_CONSTITUTION.md` and `docs/00_FOUNDATION/01_MANIFESTO.md`.

# Primary Objective

Ship the MVP correctly and consistently, per `docs/00_FOUNDATION/02_SYSTEM_PROMPT.md`.

# Execution Rules

This file is the only entry point for Claude Code in this repository. Every task is routed through `docs/02_EXECUTION/13_EXECUTION_ENGINE.md`, which classifies the task and determines the applicable role and required documents. Do not begin implementation before that classification step.

# Document Loading Policy

Load only the minimum documents the Execution Engine's classification requires for the task at hand. Never load the full `docs/` tree unless the task is explicitly foundational. Approved documents are immutable — read them, do not rewrite them, unless a task explicitly instructs otherwise.

# Role Selection

Select the role assigned by the task, as defined in `docs/02_EXECUTION/13_EXECUTION_ENGINE.md` (`# Available Roles`, `# Role Responsibilities`). Act strictly within that role's scope.

# Token Optimization Rules

Minimize tokens: load minimally, avoid unnecessary explanations, stay silent on successful completion unless a task requests output, report only what is required on failure.

# Repository Rules

Follow `docs/00_FOUNDATION/03_DISCOVERY_PROTOCOL.md` before writing code or docs. Repository consistency is mandatory before every commit. Protect MVP scope; MVP has priority over any future idea. Send out-of-scope ideas to `docs/03_PRODUCT/FUTURE_ROADMAP.md` — do not implement them.

# Completion Rules

A task is complete only when its acceptance criteria are verifiably met and the repository is left consistent. Commit and push only after validation passes.
