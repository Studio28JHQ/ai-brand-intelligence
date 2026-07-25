import { ProductCapability } from './product-capability';
import { UnknownProductCapabilityError } from './audit.errors';

interface CatalogEntry {
  capability: ProductCapability;
  technicalCapabilityId: string;
}

export class CapabilityCatalog {
  private readonly entries = new Map<string, CatalogEntry>();

  register(capability: ProductCapability, technicalCapabilityId: string): void {
    this.entries.set(capability.id, { capability, technicalCapabilityId });
  }

  list(): ReadonlyArray<ProductCapability> {
    return Array.from(this.entries.values()).map((entry) => entry.capability);
  }

  resolveTechnicalCapabilityId(productCapabilityId: string): string {
    const entry = this.entries.get(productCapabilityId);
    if (!entry) {
      throw new UnknownProductCapabilityError(productCapabilityId);
    }
    return entry.technicalCapabilityId;
  }
}
