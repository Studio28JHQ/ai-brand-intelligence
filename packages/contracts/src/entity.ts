export type EntityType = 'name' | 'domain';

export type EntitySourceLocation = 'title' | 'metaDescription' | 'canonicalUrl';

export interface Entity {
  id: string;
  auditId: string;
  name: string;
  type: EntityType;
  sourceLocation: EntitySourceLocation;
  confidence: number;
}

export interface EntityResult {
  entities: Entity[];
}

export interface EntityItemSummary {
  name: string;
  type: EntityType;
  sourceLocation: EntitySourceLocation;
  confidence: number;
}

export interface EntitySummary {
  entities: EntityItemSummary[];
}
