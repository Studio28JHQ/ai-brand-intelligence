-- CreateTable
CREATE TABLE "crawl_results" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "final_url" TEXT NOT NULL,
    "http_status" INTEGER NOT NULL,
    "headers" JSONB NOT NULL,
    "html" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawl_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crawl_results_audit_id_key" ON "crawl_results"("audit_id");

-- AddForeignKey
ALTER TABLE "crawl_results" ADD CONSTRAINT "crawl_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
