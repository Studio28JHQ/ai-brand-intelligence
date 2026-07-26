import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { ClientMetadata } from '@ai-visibility/contracts';
import { ClientQueryService } from '../../application/client/client-query.service';
import { CreateClientUseCase } from '../../application/client/create-client.use-case';
import { ClientAlreadyExistsError } from '../../domain/client/client.errors';
import { CreateClientDto } from './dto/create-client.dto';
import { toClientMetadata } from './client-metadata.mapper';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientQueryService: ClientQueryService,
    private readonly createClientUseCase: CreateClientUseCase,
  ) {}

  @Get()
  async list(): Promise<ClientMetadata[]> {
    const clients = await this.clientQueryService.list();
    return clients.map(toClientMetadata);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ClientMetadata> {
    const client = await this.clientQueryService.getById(id);
    if (!client) {
      throw new NotFoundException(`Client not found: ${id}`);
    }
    return toClientMetadata(client);
  }

  @Post()
  async create(@Body() dto: CreateClientDto): Promise<ClientMetadata> {
    if (typeof dto?.name !== 'string' || dto.name.trim().length === 0) {
      throw new BadRequestException('name is required');
    }
    if (typeof dto?.industry !== 'string' || dto.industry.trim().length === 0) {
      throw new BadRequestException('industry is required');
    }
    if (typeof dto?.primaryDomain !== 'string' || dto.primaryDomain.trim().length === 0) {
      throw new BadRequestException('primaryDomain is required');
    }

    try {
      const client = await this.createClientUseCase.execute(dto.name, dto.industry, dto.primaryDomain);
      return toClientMetadata(client);
    } catch (error) {
      if (error instanceof ClientAlreadyExistsError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
