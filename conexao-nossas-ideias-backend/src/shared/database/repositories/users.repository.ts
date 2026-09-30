import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.UsersCreateArgs) {
    return this.prismaService.users.create(createDto);
  }

  findUnique(findUniqueDto: Prisma.UsersFindUniqueArgs) {
    return this.prismaService.users.findUnique(findUniqueDto);
  }

  findFirst(findFirstDto: Prisma.UsersFindFirstArgs) {
    return this.prismaService.users.findFirst(findFirstDto);
  }

  findMany(findManyDto: Prisma.UsersFindManyArgs) {
    return this.prismaService.users.findMany(findManyDto);
  }

  update(updateDto: Prisma.UsersUpdateArgs) {
    return this.prismaService.users.update(updateDto);
  }

  delete(deleteDto: Prisma.UsersDeleteArgs) {
    return this.prismaService.users.delete(deleteDto);
  }
}
