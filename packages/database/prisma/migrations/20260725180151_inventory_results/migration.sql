-- CreateTable
CREATE TABLE "inventory_results" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "title" TEXT,
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "language" TEXT,
    "charset" TEXT,
    "h1_count" INTEGER NOT NULL,
    "internal_link_count" INTEGER NOT NULL,
    "external_link_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_results_audit_id_key" ON "inventory_results"("audit_id");

-- AddForeignKey
ALTER TABLE "inventory_results" ADD CONSTRAINT "inventory_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
