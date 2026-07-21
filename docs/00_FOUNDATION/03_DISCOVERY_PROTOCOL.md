# Objective

To ensure that no implementation work begins until the task, the existing system, and the impact of the change are all properly understood. Discovery is a mandatory phase that precedes writing code, not an optional courtesy.

# Inputs

Before discovery can begin, the following must be available:

- A clearly stated objective or task.
- Its stated acceptance criteria.
- Access to the current state of the repository.
- Access to the governing documentation of the project.

If any required input is missing or unclear, discovery cannot be considered complete.

# Repository Inspection

- Examine the current state of the repository before assuming what does or does not exist.
- Identify existing code, structures, or conventions relevant to the task.
- Do not create new code, files, or structures without first confirming that equivalent ones are not already present.
- Treat the repository's current state as the source of truth over memory or assumption.

# Existing Documentation Review

- Review governing and relevant documentation before forming an implementation approach.
- Confirm that the task does not conflict with previously approved decisions or definitions.
- Treat approved documentation as authoritative; do not silently override it.

# Dependency Identification

- Identify what the task depends on: other components, prior decisions, or unfinished prerequisites.
- Identify what depends on the area the task touches.
- Do not proceed on a task whose dependencies are unmet or unverified.

# Impact Analysis

- Determine which modules, components, or documents will be affected by the change.
- Favor the option that minimizes architectural impact and footprint.
- Prioritize backward compatibility; a change that breaks existing behavior without necessity is a regression, not progress.
- Reuse existing components whenever they satisfy the need; avoid creating duplicate or parallel implementations.

# Implementation Decision

- Choose the simplest approach that fully satisfies the objective and its acceptance criteria.
- If the requirements conflict with approved documentation, stop and surface the conflict instead of proceeding.
- If more than one valid approach exists, choose the one with the least long-term complexity and the greatest maintainability.

# Validation Checklist

Before implementation is considered ready to commit, confirm that:

- The objective is fully understood.
- The repository has been inspected for existing, reusable work.
- Relevant documentation has been reviewed and is not contradicted.
- Dependencies have been identified and satisfied.
- Impact on other modules has been analyzed and minimized.
- Every stated acceptance criterion is met.
- The repository is left in a consistent, working state.
