/*
  Warnings:

  - Added the required column `redirect_chain` to the `crawl_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Existing rows predate redirect-chain tracking, so backfill them with an empty array (no
-- redirect data was ever discarded for a row we can recover it for) before enforcing NOT NULL.
ALTER TABLE "crawl_results" ADD COLUMN     "redirect_chain" JSONB;
UPDATE "crawl_results" SET "redirect_chain" = '[]'::jsonb WHERE "redirect_chain" IS NULL;
ALTER TABLE "crawl_results" ALTER COLUMN "redirect_chain" SET NOT NULL;

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heuristic_results" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "heuristics" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heuristic_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "signals_audit_id_idx" ON "signals"("audit_id");

-- CreateIndex
CREATE INDEX "heuristic_results_audit_id_idx" ON "heuristic_results"("audit_id");

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heuristic_results" ADD CONSTRAINT "heuristic_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
