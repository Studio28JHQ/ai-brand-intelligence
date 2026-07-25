import type { Entity, EntitySourceLocation, EntityType, InventoryResult } from '@ai-visibility/contracts';

interface Candidate {
  name: string;
  type: EntityType;
  sourceLocation: EntitySourceLocation;
  confidence: number;
}

const CAPITALIZED_PHRASE_PATTERN = /\b[A-Z][a-zA-Z0-9&'-]*(?:\s+[A-Z][a-zA-Z0-9&'-]*)*\b/g;

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').normalize('NFC');
}

function extractPhrases(text: string): string[] {
  const matches = text.match(CAPITALIZED_PHRASE_PATTERN) ?? [];
  return matches.map(normalizeName).filter((phrase) => phrase.length > 1);
}

function collectCandidates(inventory: InventoryResult): Candidate[] {
  const candidates: Candidate[] = [];

  if (inventory.title) {
    for (const name of extractPhrases(inventory.title)) {
      candidates.push({ name, type: 'name', sourceLocation: 'title', confidence: 0.9 });
    }
  }

  if (inventory.metaDescription) {
    for (const name of extractPhrases(inventory.metaDescription)) {
      candidates.push({ name, type: 'name', sourceLocation: 'metaDescription', confidence: 0.6 });
    }
  }

  if (inventory.canonicalUrl) {
    try {
      const hostname = normalizeName(new URL(inventory.canonicalUrl).hostname);
      candidates.push({ name: hostname, type: 'domain', sourceLocation: 'canonicalUrl', confidence: 1 });
    } catch {
      // canonical URL is not a valid absolute URL: no domain entity to extract
    }
  }

  return candidates;
}

function deduplicate(candidates: Candidate[]): Candidate[] {
  const byKey = new Map<string, Candidate>();

  for (const candidate of candidates) {
    const key = `${candidate.type}:${candidate.name.toLowerCase()}`;
    const existing = byKey.get(key);

    if (!existing || candidate.confidence > existing.confidence) {
      byKey.set(key, candidate);
    }
  }

  return Array.from(byKey.values());
}

function slug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function extractEntities(auditId: string, inventory: InventoryResult): Entity[] {
  const candidates = deduplicate(collectCandidates(inventory));

  return candidates.map((candidate) => ({
    id: `${auditId}:${candidate.type}:${slug(candidate.name)}`,
    auditId,
    name: candidate.name,
    type: candidate.type,
    sourceLocation: candidate.sourceLocation,
    confidence: candidate.confidence,
  }));
}
