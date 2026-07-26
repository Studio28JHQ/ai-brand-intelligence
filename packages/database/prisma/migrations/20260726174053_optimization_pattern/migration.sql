-- CreateTable
CREATE TABLE "optimization_patterns" (
    "id" TEXT NOT NULL,
    "optimization_rule_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "occurrence_count" INTEGER NOT NULL,
    "distinct_project_count" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "discovered_at" TIMESTAMP(3) NOT NULL,
    "last_recomputed_at" TIMESTAMP(3) NOT NULL,
    "invalidated_at" TIMESTAMP(3),

    CONSTRAINT "optimization_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "optimization_patterns_optimization_rule_id_key" ON "optimization_patterns"("optimization_rule_id");
