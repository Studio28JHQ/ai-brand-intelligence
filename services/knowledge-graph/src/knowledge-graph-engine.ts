import type { Entity, KnowledgeGraphResult } from '@ai-visibility/contracts';
import { buildGraph } from './build-graph';
import { saveGraph } from './knowledge-graph-repository';

export async function runKnowledgeGraph(auditId: string, entities: Entity[]): Promise<KnowledgeGraphResult> {
  const { nodes, relationships } = buildGraph(auditId, entities);
  await saveGraph(nodes, relationships);
  return { nodes, relationships };
}
