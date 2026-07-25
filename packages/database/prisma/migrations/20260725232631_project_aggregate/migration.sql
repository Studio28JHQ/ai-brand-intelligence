/*
  Warnings:

  - Added the required column `project_id` to the `audit_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audit_requests" ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical_website" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_audit_id" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_canonical_website_key" ON "projects"("canonical_website");

-- AddForeignKey
ALTER TABLE "audit_requests" ADD CONSTRAINT "audit_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
