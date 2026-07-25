-- AlterTable
ALTER TABLE "audit_requests" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "failed_at" TIMESTAMP(3);
