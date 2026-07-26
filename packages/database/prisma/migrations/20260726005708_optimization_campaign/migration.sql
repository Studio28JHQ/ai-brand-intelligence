-- CreateTable
CREATE TABLE "optimization_campaigns" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "source_audit_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "optimization_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimization_actions" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "supporting_finding_ids" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "optimization_actions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "optimization_campaigns" ADD CONSTRAINT "optimization_campaigns_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_actions" ADD CONSTRAINT "optimization_actions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "optimization_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
