import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { Client, ClientStatus } from '../../domain/client/client.entity';
import { ClientRepository } from '../../domain/client/client.repository';
import { PRISMA_CLIENT } from '../database/database.module';

interface ClientRecord {
  id: string;
  name: string;
  industry: string;
  primaryDomain: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(name: string, industry: string, primaryDomain: string): Promise<Client> {
    const record = await this.prisma.client.create({ data: { name, industry, primaryDomain } });
    return this.toDomain(record);
  }

  async findByPrimaryDomain(primaryDomain: string): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({ where: { primaryDomain } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Client[]> {
    const records = await this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: ClientRecord): Client {
    return Client.fromPersistence({
      id: record.id,
      name: record.name,
      industry: record.industry,
      primaryDomain: record.primaryDomain,
      status: record.status as ClientStatus,
      createdAt: record.createdAt,
    });
  }
}
