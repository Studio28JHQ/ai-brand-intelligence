export interface InventoryResult {
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  language: string | null;
  charset: string | null;
  h1Count: number;
  internalLinkCount: number;
  externalLinkCount: number;
}

export interface InventorySummary {
  title: string | null;
  canonicalUrl: string | null;
  language: string | null;
  h1Count: number;
  internalLinkCount: number;
  externalLinkCount: number;
}
