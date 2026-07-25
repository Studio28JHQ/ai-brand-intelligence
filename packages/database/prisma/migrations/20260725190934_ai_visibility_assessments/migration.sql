-- CreateTable
CREATE TABLE "ai_visibility_assessments" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "graph_completeness" TEXT NOT NULL,
    "entity_coverage" TEXT NOT NULL,
    "relationship_coverage" TEXT NOT NULL,
    "missing_signals" JSONB NOT NULL,
    "assessed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_visibility_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_visibility_assessments_audit_id_key" ON "ai_visibility_assessments"("audit_id");

-- AddForeignKey
ALTER TABLE "ai_visibility_assessments" ADD CONSTRAINT "ai_visibility_assessments_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
