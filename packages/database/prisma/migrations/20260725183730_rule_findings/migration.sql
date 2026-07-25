/*
  Warnings:

  - You are about to drop the column `status` on the `findings` table. All the data in the column will be lost.
  - Added the required column `evidence` to the `findings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome` to the `findings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rule_id` to the `findings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "findings" DROP COLUMN "status",
ADD COLUMN     "evidence" JSONB NOT NULL,
ADD COLUMN     "outcome" TEXT NOT NULL,
ADD COLUMN     "rule_id" TEXT NOT NULL;
