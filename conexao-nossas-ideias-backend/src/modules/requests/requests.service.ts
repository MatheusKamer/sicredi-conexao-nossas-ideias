import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsRepository } from 'src/shared/database/repositories/requests.repository';
import { RequestsStatusType } from './entities/request.entity';
import { FindRequestsDto } from './dto/find-requests.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepo: RequestsRepository) {}

  create(createRequestDto: CreateRequestDto) {
    const { title, description, requester, areaId, priority } =
      createRequestDto;

    return this.requestsRepo.create({
      data: {
        title,
        description,
        requester,
        areaId,
        priority,
      },
    });
  }

  findAll({
    search,
    status,
    priority,
    areaId,
    page = 1,
    limit = 10,
  }: FindRequestsDto) {
    return this.requestsRepo.findMany({
      where: {
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
        status,
        priority,
        areaId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const request = await this.requestsRepo.findUnique({
      where: { id },
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
      throw new Error('Only requests with status PENDING can be removed');
    }

    return this.requestsRepo.delete({
      where: { id },
    });
  }
}
