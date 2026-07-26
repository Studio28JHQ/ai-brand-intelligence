import { Module } from '@nestjs/common';
import { ClientRepositoryModule } from '../../infrastructure/client/client-repository.module';
import { ClientQueryService } from '../../application/client/client-query.service';
import { CreateClientUseCase } from '../../application/client/create-client.use-case';
import { ClientController } from './client.controller';

@Module({
  imports: [ClientRepositoryModule],
  controllers: [ClientController],
  providers: [ClientQueryService, CreateClientUseCase],
})
export class ClientModule {}
