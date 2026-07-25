import type { Entity, GraphNode, GraphRelationship } from '@ai-visibility/contracts';

const FOUND_ON_RELATIONSHIP = 'found-on';

function slug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function buildNodes(auditId: string, entities: Entity[]): GraphNode[] {
  const byKey = new Map<string, GraphNode>();

  for (const entity of entities) {
    const key = `${entity.type}:${entity.name.toLowerCase()}`;

    if (!byKey.has(key)) {
      byKey.set(key, {
        id: `${auditId}:node:${entity.type}:${slug(entity.name)}`,
        auditId,
        entityId: entity.id,
        name: entity.name,
        type: entity.type,
      });
    }
  }

  return Array.from(byKey.values());
}

function buildRelationships(auditId: string, nodes: GraphNode[]): GraphRelationship[] {
  const domainNode = nodes.find((node) => node.type === 'domain');

  if (!domainNode) {
    return [];
  }

  return nodes
    .filter((node) => node.id !== domainNode.id)
    .map((node) => ({
      id: `${auditId}:rel:${FOUND_ON_RELATIONSHIP}:${node.id}:${domainNode.id}`,
      auditId,
      type: FOUND_ON_RELATIONSHIP,
      sourceNodeId: node.id,
      targetNodeId: domainNode.id,
    }));
}

export interface Graph {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export function buildGraph(auditId: string, entities: Entity[]): Graph {
  const nodes = buildNodes(auditId, entities);
  const relationships = buildRelationships(auditId, nodes);

  return { nodes, relationships };
}
