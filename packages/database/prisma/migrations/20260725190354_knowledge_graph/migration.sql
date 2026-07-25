-- CreateTable
CREATE TABLE "graph_nodes" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graph_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_relationships" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source_node_id" TEXT NOT NULL,
    "target_node_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graph_relationships_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relationships" ADD CONSTRAINT "graph_relationships_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relationships" ADD CONSTRAINT "graph_relationships_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "graph_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relationships" ADD CONSTRAINT "graph_relationships_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "graph_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
