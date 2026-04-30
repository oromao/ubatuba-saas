import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthService } from '../src/modules/health/health.service';
import { RedisService } from '../src/modules/shared/redis.service';

const mockConnection = {
  readyState: 1,
};

const mockRedisService = {
  status: jest.fn().mockResolvedValue({ status: 'connected' }),
};

describe('HealthService - Observability (T9-OBSERVABILITY)', () => {
  let service: HealthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getConnectionToken(), useValue: mockConnection },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = moduleRef.get<HealthService>(HealthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection.readyState = 1;
    mockRedisService.status.mockResolvedValue({ status: 'connected' });
  });

  it('should return ok when all components healthy', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.components.mongodb.status).toBe('ok');
    expect(result.components.redis.status).toBe('ok');
    expect(result.components.memory.status).toBe('ok');
    expect(result.uptimeSeconds).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });

  it('should report degraded when mongo is down', async () => {
    mockConnection.readyState = 0;
    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.components.mongodb.status).toBe('down');
  });

  it('should report degraded when redis fails', async () => {
    mockRedisService.status.mockRejectedValue(new Error('timeout'));
    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.components.redis.status).toBe('down');
  });

  it('should report degraded when redis is not connected', async () => {
    mockRedisService.status.mockResolvedValue({ status: 'disconnected' });
    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.components.redis.status).toBe('degraded');
  });

  it('should include memory component', async () => {
    const result = await service.check();
    expect(result.components.memory).toBeDefined();
    expect(['ok', 'degraded']).toContain(result.components.memory.status);
  });

  it('should include latency for mongo and redis', async () => {
    const result = await service.check();
    expect(result.components.mongodb.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.components.redis.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
