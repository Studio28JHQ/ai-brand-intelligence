import { Client } from './client.entity';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export interface ClientRepository {
  create(name: string, industry: string, primaryDomain: string): Promise<Client>;
  findByPrimaryDomain(primaryDomain: string): Promise<Client | null>;
  findById(id: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
}
