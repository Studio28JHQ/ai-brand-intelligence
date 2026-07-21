# Purpose

To serve as the single entry point through which every future task is understood, classified, and carried out — ensuring that execution stays deterministic, minimally costly, and always aligned with the project's governing documents.

# Execution Flow

1. Receive the task.
2. Classify the task by type.
3. Load only the documents required for that classification.
4. Execute the task according to the loaded documents and the assigned role.
5. Validate the result against the task's acceptance criteria.
6. Confirm repository consistency.
7. Commit and, if instructed, push.

No step may be skipped, and no step may be performed out of order.

# Available Roles

- Architect: defines permanent structure, governing documents, and cross-cutting design.
- Engineer: implements assigned functionality within established structure and constraints.
- Reviewer: validates completed work against acceptance criteria and governing documents.
- Documenter: records decisions, outcomes, and non-permanent context without altering governing documents.

A task is carried out under exactly one role at a time. A role acts strictly within its defined responsibilities.

# Role Responsibilities

- Architect: produces or amends foundational and structural documents; does not implement functionality.
- Engineer: produces or amends functional work within defined scope; does not alter governing documents.
- Reviewer: assesses correctness, consistency, and scope adherence; does not implement or redesign.
- Documenter: captures outcomes and decisions in the appropriate non-permanent record; does not set direction.

Any responsibility not explicitly granted to a role is outside that role's authority for the task at hand.

# Task Classification

Every task is classified before execution as one of:

- Foundational: establishes or amends permanent, project-wide governing documents.
- Structural: establishes cross-cutting organization that future work depends on.
- Functional: implements or modifies a specific capability within existing structure.
- Corrective: fixes a deviation from acceptance criteria or governing documents without expanding scope.

Classification determines which documents must be loaded and which role applies.

# Required Documents Per Task

- Foundational tasks require the full foundational document set.
- Structural tasks require the foundational document set plus any structural documents directly relevant to the area being organized.
- Functional tasks require only the structural and reference documents relevant to the specific capability being touched.
- Corrective tasks require only the document that defines the acceptance criteria being corrected against.

No task requires loading documents outside its classification's defined set.

# Document Loading Rules

- Load the minimum set of documents necessary to satisfy the task's classification.
- Never load the entire documentation set when a narrower set is sufficient.
- Treat already-approved documents as authoritative without re-deriving their content.
- If a needed document is missing or ambiguous, stop and surface the gap rather than guessing its content.

# Execution Lifecycle

1. Classify.
2. Load minimum required documents.
3. Execute under the applicable role.
4. Self-validate against acceptance criteria.
5. Confirm the repository is internally consistent.
6. Record the outcome where required.
7. Commit and push only after all prior steps pass.

A task that fails any lifecycle step returns to the step that failed rather than proceeding.

# Validation Rules

- No commit occurs until every stated acceptance criterion has been verified as met.
- No task may override, weaken, or silently reinterpret an approved governing document.
- A task whose requirements conflict with an approved document halts and surfaces the conflict instead of proceeding.
- Validation is performed against the documents actually loaded for the task's classification, not from assumption.

# Completion Rules

- A task is complete only when its acceptance criteria are met, the repository is left consistent, and required commits are made.
- Work outside the task's defined scope is not performed, regardless of perceived value.
- Ideas identified outside current scope are recorded for later consideration rather than acted upon.
- Silence is the default output of a successfully completed task.
