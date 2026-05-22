import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LgpdAuditService } from '../src/common/services/lgpd-audit.service';
import { LgpdAudit } from '../src/common/schemas/lgpd-audit.schema';

const mockModel = () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }),
  }),
  countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
});

describe('LgpdAuditService', () => {
  let service: LgpdAuditService;
  let model: ReturnType<typeof mockModel>;

  beforeEach(async () => {
    model = mockModel();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LgpdAuditService,
        { provide: getModelToken(LgpdAudit.name), useValue: model },
      ],
    }).compile();
    service = module.get<LgpdAuditService>(LgpdAuditService);
  });

  it('should log access entry', async () => {
    await service.logAccess({
      tenantId: 'tenant-1',
      action: 'CONSENT_RECORDED',
      resourceType: 'CITIZEN_CALL',
      resourceId: 'call-123',
      fields: ['reporterName', 'reporterContact'],
      reason: 'Consentimento explicito art. 7 LGPD',
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        action: 'CONSENT_RECORDED',
        resourceType: 'CITIZEN_CALL',
        resourceId: 'call-123',
        anonymized: false,
      }),
    );
  });

  it('should query by tenant', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: '1', tenantId: 'tenant-1' }]) }),
      }),
    });
    const result = await service.query({ tenantId: 'tenant-1' });
    expect(result).toHaveLength(1);
  });

  it('should count by tenant', async () => {
    model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(5) });
    const count = await service.countByTenant('tenant-1');
    expect(count).toBe(5);
  });

  it('should anonymize and log', async () => {
    const result = await service.anonymize('tenant-1', 'CITIZEN', 'call-123');
    expect(result).toBe(true);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ANONYMIZE', reason: expect.stringContaining('LGPD') }),
    );
  });

  it('should filter by action type', async () => {
    await service.query({ action: 'DELETE_PERSONAL_DATA' });
    expect(model.find).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_PERSONAL_DATA' }));
  });
});
