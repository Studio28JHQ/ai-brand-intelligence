export interface GraphNode {
  id: string;
  auditId: string;
  entityId: string;
  name: string;
  type: string;
}

export interface GraphRelationship {
  id: string;
  auditId: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface KnowledgeGraphResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface KnowledgeGraphSummary {
  totalEntities: number;
  totalRelationships: number;
  entityTypes: string[];
  relationshipTypes: string[];
}
