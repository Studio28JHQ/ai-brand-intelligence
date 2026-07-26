import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { Client } from '../../domain/client/client.entity';

@Injectable()
export class ClientQueryService {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository) {}

  async list(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }

  async getById(id: string): Promise<Client | null> {
    return this.clientRepository.findById(id);
  }
}
