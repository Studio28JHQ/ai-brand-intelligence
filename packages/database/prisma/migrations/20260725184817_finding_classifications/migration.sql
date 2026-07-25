-- CreateTable
CREATE TABLE "finding_classifications" (
    "id" TEXT NOT NULL,
    "finding_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finding_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finding_classifications_finding_id_key" ON "finding_classifications"("finding_id");

-- AddForeignKey
ALTER TABLE "finding_classifications" ADD CONSTRAINT "finding_classifications_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_classifications" ADD CONSTRAINT "finding_classifications_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
