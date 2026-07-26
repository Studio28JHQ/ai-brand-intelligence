import type { ClientMetadata } from '@ai-visibility/contracts';
import { Client } from '../../domain/client/client.entity';

export function toClientMetadata(client: Client): ClientMetadata {
  return {
    id: client.id,
    name: client.name,
    industry: client.industry,
    primaryDomain: client.primaryDomain,
    status: client.status,
    createdAt: client.createdAt.toISOString(),
  };
}
