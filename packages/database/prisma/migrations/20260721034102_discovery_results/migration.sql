-- CreateTable
CREATE TABLE "discovery_results" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "normalized_url" TEXT NOT NULL,
    "robots_txt_url" TEXT NOT NULL,
    "robots_txt_detected" BOOLEAN NOT NULL,
    "sitemap_url" TEXT NOT NULL,
    "sitemap_detected" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discovery_results_audit_id_key" ON "discovery_results"("audit_id");

-- AddForeignKey
ALTER TABLE "discovery_results" ADD CONSTRAINT "discovery_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
