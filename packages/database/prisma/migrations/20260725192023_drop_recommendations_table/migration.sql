/*
  Warnings:

  - You are about to drop the `recommendations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_audit_id_fkey";

-- DropTable
DROP TABLE "recommendations";
