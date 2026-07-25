import type { InventoryResult } from '@ai-visibility/contracts';
import { extractInventory } from './extract-inventory';
import { saveInventoryResult } from './inventory-repository';

export async function runInventory(auditId: string, html: string, pageUrl: string): Promise<InventoryResult> {
  const result = extractInventory(html, pageUrl);
  await saveInventoryResult(auditId, result);
  return result;
}
