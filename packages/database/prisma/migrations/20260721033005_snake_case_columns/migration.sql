/*
  Warnings:

  - You are about to drop the column `createdAt` on the `audit_requests` table. All the data in the column will be lost.
  - You are about to drop the column `bootstrappedAt` on the `platform_meta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_requests" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "platform_meta" DROP COLUMN "bootstrappedAt",
ADD COLUMN     "bootstrapped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
