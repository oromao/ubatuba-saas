import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ErrorLogService } from '../src/common/services/error-log.service';
import { ErrorLog } from '../src/common/schemas/error-log.schema';

const mockModel = () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }),
  }),
  countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
  updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
});

describe('ErrorLogService', () => {
  let service: ErrorLogService;
  let model: ReturnType<typeof mockModel>;

  beforeEach(async () => {
    model = mockModel();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLogService,
        { provide: getModelToken(ErrorLog.name), useValue: model },
      ],
    }).compile();
    service = module.get<ErrorLogService>(ErrorLogService);
  });

  it('should log a 500 error', async () => {
    await service.log({ status: 500, method: 'GET', url: '/api/test', detail: 'Internal error', errorCode: 'INTERNAL_ERROR' });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500, url: '/api/test', resolved: false }),
    );
  });

  it('should log a 400 error', async () => {
    await service.log({ status: 400, method: 'POST', url: '/api/data', detail: 'Bad request' });
    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('should list errors with filters', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: '1', status: 500 }]) }) }),
    });
    const result = await service.list({ status: 500, limit: 10 });
    expect(result).toHaveLength(1);
  });

  it('should count unresolved errors', async () => {
    model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(3) });
    const count = await service.countUnresolved();
    expect(count).toBe(3);
  });

  it('should mark error as resolved', async () => {
    await service.markResolved('err-1', 'admin');
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'err-1' },
      expect.objectContaining({ $set: expect.objectContaining({ resolved: true }) }),
    );
  });

  it('should return stats for last 24h', async () => {
    const recentErrors = [
      { status: 500, method: 'GET', url: '/api/a' },
      { status: 500, method: 'GET', url: '/api/a' },
      { status: 400, method: 'POST', url: '/api/b' },
    ];
    model.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(recentErrors),
    });
    model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const stats = await service.getStats(24);
    expect(stats.total).toBe(3);
    expect(stats.serverErrors).toBe(2);
    expect(stats.clientErrors).toBe(1);
    expect(stats.topEndpoints).toHaveLength(2);
  });
});
