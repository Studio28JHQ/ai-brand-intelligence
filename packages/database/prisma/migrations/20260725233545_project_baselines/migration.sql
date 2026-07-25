-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "baseline_audit_id" TEXT,
ADD COLUMN     "baseline_set_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "project_baseline_history" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_baseline_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_baseline_history" ADD CONSTRAINT "project_baseline_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
