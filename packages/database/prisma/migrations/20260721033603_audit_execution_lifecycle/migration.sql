-- AlterTable
ALTER TABLE "audit_requests" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3);
