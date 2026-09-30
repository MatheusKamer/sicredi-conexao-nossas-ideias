import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class RequestsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.RequestsCreateArgs) {
    return this.prismaService.requests.create(createDto);
  }

  findUnique(findUniqueDto: Prisma.RequestsFindUniqueArgs) {
    return this.prismaService.requests.findUnique(findUniqueDto);
  }

  findFirst(findFirstDto: Prisma.RequestsFindFirstArgs) {
    return this.prismaService.requests.findFirst(findFirstDto);
  }

  findMany(findManyDto: Prisma.RequestsFindManyArgs) {
    return this.prismaService.requests.findMany(findManyDto);
  }

  update(updateDto: Prisma.RequestsUpdateArgs) {
    return this.prismaService.requests.update(updateDto);
  }

  delete(deleteDto: Prisma.RequestsDeleteArgs) {
    return this.prismaService.requests.delete(deleteDto);
  }
}
