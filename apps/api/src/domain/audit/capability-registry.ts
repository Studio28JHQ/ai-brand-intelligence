import { Capability } from './capability';
import { UnknownCapabilityError } from './audit.errors';

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, Capability>();

  register(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
  }

  resolve(capabilityId: string): Capability {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) {
      throw new UnknownCapabilityError(capabilityId);
    }
    return capability;
  }
}
