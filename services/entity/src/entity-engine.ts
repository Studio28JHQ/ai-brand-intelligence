import type { EntityResult, InventoryResult } from '@ai-visibility/contracts';
import { extractEntities } from './extract-entities';
import { saveEntities } from './entity-repository';

export async function runEntityExtraction(auditId: string, inventory: InventoryResult): Promise<EntityResult> {
  const entities = extractEntities(auditId, inventory);
  await saveEntities(entities);
  return { entities };
}
