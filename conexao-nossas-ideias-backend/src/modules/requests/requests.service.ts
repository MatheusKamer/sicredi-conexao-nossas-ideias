import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsRepository } from 'src/shared/database/repositories/requests.repository';
import {
  RequestsPriorityType,
  RequestsStatusType,
} from './entities/request.entity';
import { FindRequestsDto } from './dto/find-requests.dto';
import { Prisma } from 'generated/prisma/client';

const requestRelations = {
  user: { select: { id: true, name: true } },
  area: { select: { id: true, name: true, type: true } },
} satisfies Prisma.RequestsInclude;

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepo: RequestsRepository) {}

  create(userId: string, createRequestDto: CreateRequestDto) {
    const { title, description, areaId, priority } = createRequestDto;

    return this.requestsRepo.create({
      data: {
        title,
        description,
        requester: userId,
        areaId,
        priority,
      },
      include: requestRelations,
    });
  }

  async findAll({
    search,
    status,
    priority,
    areaId,
    page = 1,
    limit = 10,
    order = 'desc',
  }: FindRequestsDto) {
    const where: Prisma.RequestsWhereInput = {
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
      status,
      priority,
      areaId,
    };

    const [data, total] = await Promise.all([
      this.requestsRepo.findMany({
        where,
        include: requestRelations,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: order,
        },
      }),
      this.requestsRepo.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary() {
    const statuses = Object.values(RequestsStatusType);
    const priorities = Object.values(RequestsPriorityType);

    const [total, statusCounts, priorityCounts] = await Promise.all([
      this.requestsRepo.count({}),
      Promise.all(
        statuses.map((status) =>
          this.requestsRepo.count({ where: { status } }),
        ),
      ),
      Promise.all(
        priorities.map((priority) =>
          this.requestsRepo.count({ where: { priority } }),
        ),
      ),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(
        statuses.map((status, index) => [status, statusCounts[index]]),
      ) as Record<RequestsStatusType, number>,
      byPriority: Object.fromEntries(
        priorities.map((priority, index) => [priority, priorityCounts[index]]),
      ) as Record<RequestsPriorityType, number>,
    };
  }

  async findOne(id: string) {
    const request = await this.requestsRepo.findUnique({
      where: { id },
      include: requestRelations,
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    const { status, decisionComment } = updateRequestDto;

    const request = await this.requestsRepo.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    const isDecision =
      status === RequestsStatusType.APPROVED ||
      status === RequestsStatusType.REJECTED;

    if (status !== RequestsStatusType.UNDER_REVIEW && !isDecision) {
      throw new BadRequestException('Invalid request status');
    }

    if (isDecision && !decisionComment) {
      throw new BadRequestException(
        'Decision comment is required when approving or rejecting a request',
      );
    }

    return this.requestsRepo.update({
      where: { id },
      data: {
        status,
        decisionComment,
        decidedAt: isDecision ? new Date() : null,
      },
      include: requestRelations,
    });
  }

  async remove(id: string) {
    const request = await this.requestsRepo.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Only requests with status PENDING can be removed',
      );
    }

    return this.requestsRepo.delete({
      where: { id },
    });
  }
}
