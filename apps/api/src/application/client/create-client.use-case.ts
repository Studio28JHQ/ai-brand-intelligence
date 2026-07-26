import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { Client } from '../../domain/client/client.entity';
import { ClientAlreadyExistsError } from '../../domain/client/client.errors';

@Injectable()
export class CreateClientUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository) {}

  async execute(name: string, industry: string, primaryDomain: string): Promise<Client> {
    const existing = await this.clientRepository.findByPrimaryDomain(primaryDomain);
    if (existing) {
      throw new ClientAlreadyExistsError(primaryDomain);
    }

    return this.clientRepository.create(name, industry, primaryDomain);
  }
}
