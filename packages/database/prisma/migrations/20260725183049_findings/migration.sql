-- CreateTable
CREATE TABLE "findings" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source_engine" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
