-- CreateTable
CREATE TABLE "workflow_execution_records" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_execution_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workflow_execution_records" ADD CONSTRAINT "workflow_execution_records_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
