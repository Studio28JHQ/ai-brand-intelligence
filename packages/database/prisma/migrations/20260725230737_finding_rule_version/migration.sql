/*
  Warnings:

  - Added the required column `rule_version` to the `findings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "findings" ADD COLUMN     "rule_version" TEXT NOT NULL;
