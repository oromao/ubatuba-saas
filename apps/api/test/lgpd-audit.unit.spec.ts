import { Test, TestingModule } from '@nestjs/testing';
import { LgpdAuditService } from '../src/common/services/lgpd-audit.service';

describe('LgpdAuditService (T9-LGPD-DATA)', () => {
  let service: LgpdAuditService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LgpdAuditService],
    }).compile();
    service = moduleRef.get<LgpdAuditService>(LgpdAuditService);
  });

  it('should log personal data access', () => {
    service.logAccess({
      tenantId: 't1',
      action: 'READ_PERSONAL_DATA',
      resourceType: 'CITIZEN',
      resourceId: 'citizen-1',
      fields: ['cpf', 'nome', 'endereco'],
      actorId: 'user-1',
      actorRole: 'OPERADOR',
    });

    const entries = service.query({ tenantId: 't1' });
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('READ_PERSONAL_DATA');
    expect(entries[0].fields).toContain('cpf');
  });

  it('should filter audit by resource type', () => {
    service.logAccess({ tenantId: 't1', action: 'READ_PERSONAL_DATA', resourceType: 'PARCEL', resourceId: 'p1' });
    service.logAccess({ tenantId: 't1', action: 'READ_PERSONAL_DATA', resourceType: 'CITIZEN', resourceId: 'c1' });

    const parcelLogs = service.query({ resourceType: 'PARCEL' });
    expect(parcelLogs).toHaveLength(1);
    expect(parcelLogs[0].resourceId).toBe('p1');
  });

  it('should filter by action type', () => {
    service.logAccess({ tenantId: 't1', action: 'EXPORT_PERSONAL_DATA', resourceType: 'CITIZEN', resourceId: 'c1' });

    const exports = service.query({ action: 'EXPORT_PERSONAL_DATA' });
    expect(exports.length).toBeGreaterThanOrEqual(1);
  });

  it('should anonymize resource and log it', () => {
    const result = service.anonymize('CITIZEN', 'citizen-old');
    expect(result.anonymized).toBe(true);

    const logs = service.query({ action: 'ANONYMIZE' });
    expect(logs[0].resourceId).toBe('citizen-old');
  });

  it('should log deletion of personal data', () => {
    service.logAccess({
      tenantId: 't1',
      action: 'DELETE_PERSONAL_DATA',
      resourceType: 'CITIZEN',
      resourceId: 'citizen-gdpr',
      reason: 'LGPD Article 18 - data deletion request',
    });

    const logs = service.query({ action: 'DELETE_PERSONAL_DATA' });
    expect(logs).toHaveLength(1);
    expect(logs[0].reason).toContain('LGPD');
  });
});
