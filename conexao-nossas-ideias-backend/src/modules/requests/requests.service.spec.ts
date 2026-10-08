import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { RequestsRepository } from 'src/shared/database/repositories/requests.repository';
import {
  RequestsPriorityType,
  RequestsStatusType,
} from './entities/request.entity';

describe('RequestsService', () => {
  let service: RequestsService;
  const requestsRepo = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: RequestsRepository, useValue: requestsRepo },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('uses the authenticated user as requester', async () => {
      await service.create('user-1', {
        title: 'Title',
        description: 'Description',
        areaId: 'area-1',
        priority: RequestsPriorityType.HIGH,
      });

      expect(requestsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ requester: 'user-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated data with meta', async () => {
      requestsRepo.findMany.mockResolvedValue([{ id: 'r1' }]);
      requestsRepo.count.mockResolvedValue(21);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result).toEqual({
        data: [{ id: 'r1' }],
        meta: { total: 21, page: 2, limit: 10, totalPages: 3 },
      });
      expect(requestsRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('applies the requested date order', async () => {
      requestsRepo.findMany.mockResolvedValue([]);
      requestsRepo.count.mockResolvedValue(0);

      await service.findAll({ order: 'asc' });

      expect(requestsRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );
    });
  });

  describe('getSummary', () => {
    it('returns totals by status and priority', async () => {
      const counts: Record<string, number> = {
        PENDING: 4,
        UNDER_REVIEW: 3,
        APPROVED: 2,
        REJECTED: 1,
        LOW: 5,
        MEDIUM: 3,
        HIGH: 2,
      };
      requestsRepo.count.mockImplementation(
        ({ where }: { where?: { status?: string; priority?: string } }) =>
          Promise.resolve(counts[where?.status ?? where?.priority ?? ''] ?? 10),
      );

      const result = await service.getSummary();

      expect(result).toEqual({
        total: 10,
        byStatus: {
          [RequestsStatusType.PENDING]: 4,
          [RequestsStatusType.UNDER_REVIEW]: 3,
          [RequestsStatusType.APPROVED]: 2,
          [RequestsStatusType.REJECTED]: 1,
        },
        byPriority: {
          [RequestsPriorityType.LOW]: 5,
          [RequestsPriorityType.MEDIUM]: 3,
          [RequestsPriorityType.HIGH]: 2,
        },
      });
    });
  });
});
