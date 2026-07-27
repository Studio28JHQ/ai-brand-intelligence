/*
  Closes the check-then-act race the application-level guard (CreateAuditUseCase, F10-S04A)
  cannot fully close on its own: two near-simultaneous requests for the same Project could both
  pass the in-memory "any pending/running Audit for this Project?" check before either has
  persisted its own row. A partial unique index makes the second INSERT fail at the database
  itself whenever a Project already has a Request row in 'pending' or 'running' status, which
  CreateAuditUseCase maps to the same DuplicateAuditExecutionError as the application-level check.
*/
CREATE UNIQUE INDEX "audit_requests_one_in_flight_per_project"
ON "audit_requests" ("project_id")
WHERE "status" IN ('pending', 'running');
