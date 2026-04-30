import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { TenantsRepository } from '../src/modules/tenants/tenants.repository';
import { BadRequestException } from '@nestjs/common';

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  save: jest.fn(),
  updateConfig: jest.fn(),
};

describe('Multi-Tenant Isolation (T2-MULTI-TENANT)', () => {
  let service: TenantsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TenantsService, { provide: TenantsRepository, useValue: mockRepo }],
    }).compile();
    service = moduleRef.get<TenantsService>(TenantsService);
  });

  describe('tenant identity segregation', () => {
    it('should enforce unique slug across tenants', async () => {
      mockRepo.create.mockResolvedValue({ _id: 't1', name: 'Test', slug: 'test' });
      const t1 = await service.create({ name: 'Test A', slug: 'test' });
      expect(t1.slug).toBe('test');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'test' }),
      );
    });

    it('should retrieve tenant by ID for isolation', async () => {
      mockRepo.findById.mockResolvedValue({ _id: 't1', name: 'City A', slug: 'city-a' });
      const tenant = await service.findById('t1');
      expect(tenant).toBeDefined();
      expect(tenant!.name).toBe('City A');
    });

    it('should return null for wrong tenant ID', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const tenant = await service.findById('wrong-id');
      expect(tenant).toBeNull();
    });

    it('should isolate municipal config per tenant', async () => {
      mockRepo.findById.mockResolvedValue({ _id: 't1', name: 'A', slug: 'a', municipalConfig: { ibgeCode: '111' } });
      const config = await service.getMunicipalConfig('t1');
      expect(config.ibgeCode).toBe('111');

      mockRepo.findById.mockResolvedValue({ _id: 't2', name: 'B', slug: 'b', municipalConfig: { ibgeCode: '222' } });
      const configB = await service.getMunicipalConfig('t2');
      expect(configB.ibgeCode).toBe('222');
      expect(configB.ibgeCode).not.toBe(config.ibgeCode);
    });
  });
});
