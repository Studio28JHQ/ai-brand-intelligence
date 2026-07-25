/*
  Warnings:

  - You are about to drop the `finding_classifications` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `severity` to the `findings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "finding_classifications" DROP CONSTRAINT "finding_classifications_audit_id_fkey";

-- DropForeignKey
ALTER TABLE "finding_classifications" DROP CONSTRAINT "finding_classifications_finding_id_fkey";

-- AlterTable
ALTER TABLE "findings" ADD COLUMN     "severity" TEXT NOT NULL;

-- DropTable
DROP TABLE "finding_classifications";
