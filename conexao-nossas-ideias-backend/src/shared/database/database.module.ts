import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepository } from './repositories/users.repository';
import { AreasRepository } from './repositories/areas.repository';
import { RequestsRepository } from './repositories/requests.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepository,
    AreasRepository,
    RequestsRepository,
  ],
  exports: [UsersRepository, AreasRepository, RequestsRepository],
})
export class DatabaseModule {}
