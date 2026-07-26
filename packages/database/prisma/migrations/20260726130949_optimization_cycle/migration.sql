/*
  Warnings:

  - Added the required column `cycle_id` to the `audit_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cycle_id` to the `optimization_campaigns` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audit_requests" ADD COLUMN     "cycle_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "optimization_campaigns" ADD COLUMN     "cycle_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "optimization_cycles" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optimization_cycles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "optimization_cycles" ADD CONSTRAINT "optimization_cycles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_campaigns" ADD CONSTRAINT "optimization_campaigns_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "optimization_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_requests" ADD CONSTRAINT "audit_requests_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "optimization_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
