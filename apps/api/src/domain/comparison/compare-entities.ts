import type { Entity, EntityComparison, EntityComparisonEntry } from '@ai-visibility/contracts';

function key(entity: Entity): string {
  return `${entity.type}:${entity.name}`;
}

function toEntry(entity: Entity): EntityComparisonEntry {
  return { name: entity.name, type: entity.type, sourceLocation: entity.sourceLocation };
}

export function compareEntities(baseline: Entity[], target: Entity[]): EntityComparison {
  const baselineByKey = new Map(baseline.map((entity) => [key(entity), entity]));
  const targetByKey = new Map(target.map((entity) => [key(entity), entity]));

  const added: EntityComparisonEntry[] = [];
  const unchanged: EntityComparisonEntry[] = [];
  for (const [entityKey, entity] of targetByKey) {
    if (baselineByKey.has(entityKey)) {
      unchanged.push(toEntry(entity));
    } else {
      added.push(toEntry(entity));
    }
  }

  const removed: EntityComparisonEntry[] = [];
  for (const [entityKey, entity] of baselineByKey) {
    if (!targetByKey.has(entityKey)) {
      removed.push(toEntry(entity));
    }
  }

  return { added, removed, unchanged };
}
