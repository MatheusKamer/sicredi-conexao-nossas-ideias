import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class AreasRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.AreasCreateArgs) {
    return this.prismaService.areas.create(createDto);
  }

  findUnique(findUniqueDto: Prisma.AreasFindUniqueArgs) {
    return this.prismaService.areas.findUnique(findUniqueDto);
  }

  findFirst(findFirstDto: Prisma.AreasFindFirstArgs) {
    return this.prismaService.areas.findFirst(findFirstDto);
  }

  findMany(findManyDto: Prisma.AreasFindManyArgs) {
    return this.prismaService.areas.findMany(findManyDto);
  }

  update(updateDto: Prisma.AreasUpdateArgs) {
    return this.prismaService.areas.update(updateDto);
  }

  delete(deleteDto: Prisma.AreasDeleteArgs) {
    return this.prismaService.areas.delete(deleteDto);
  }
}
