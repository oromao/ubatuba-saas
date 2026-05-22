import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LgpdController } from '../src/modules/lgpd/lgpd.controller';
import { LgpdAuditService } from '../src/common/services/lgpd-audit.service';

const mockAudit = {
  logAccess: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockResolvedValue([]),
  anonymize: jest.fn().mockResolvedValue(true),
  countByTenant: jest.fn().mockResolvedValue(3),
};

describe('LgpdController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LgpdController],
      providers: [{ provide: LgpdAuditService, useValue: mockAudit }],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /lgpd/consent should record consent', async () => {
    const res = await request(app.getHttpServer())
      .post('/lgpd/consent')
      .send({ resourceType: 'CITIZEN_CALL', resourceId: 'call-123', consentVersion: 'v1' })
      .expect(201);
    expect(res.body.recorded).toBe(true);
    expect(mockAudit.logAccess).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CONSENT_RECORDED', resourceId: 'call-123' }),
    );
  });

  it('POST /lgpd/delete-request should return protocol', async () => {
    const res = await request(app.getHttpServer())
      .post('/lgpd/delete-request')
      .send({ resourceType: 'CITIZEN', resourceId: 'citizen-123', reason: 'Revogação de consentimento' })
      .expect(201);
    expect(res.body.protocol).toContain('LGPD-');
    expect(res.body.message).toContain('15 dias úteis');
    expect(mockAudit.anonymize).toHaveBeenCalled();
  });

  it('GET /lgpd/audit/:tenantId should return audit trail', async () => {
    mockAudit.query.mockResolvedValueOnce([
      { id: '1', tenantId: 't1', action: 'CONSENT_RECORDED', resourceType: 'CITIZEN_CALL', resourceId: 'c1' },
    ]);
    const res = await request(app.getHttpServer())
      .get('/lgpd/audit/t1')
      .expect(200);
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it('GET /lgpd/audit/:tenantId/count should return count', async () => {
    const res = await request(app.getHttpServer())
      .get('/lgpd/audit/t1/count')
      .expect(200);
    expect(res.body.total).toBe(3);
  });
});
