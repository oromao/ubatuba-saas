import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PublicCallsController } from '../src/modules/citizen-156/public-calls.controller';
import { Citizen156Service } from '../src/modules/citizen-156/citizen-156.service';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { CacheService } from '../src/modules/shared/cache.service';
import { LgpdAuditService } from '../src/common/services/lgpd-audit.service';

const mockService = {
  create: jest.fn().mockResolvedValue({ protocolNumber: 'PROTO-001', status: 'ABERTO', _id: 'id-1' }),
};

const mockTenants = {
  findBySlug: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011' }),
};

const mockCache = {
  get: jest.fn().mockResolvedValue(0),
  set: jest.fn().mockResolvedValue(undefined),
};

const mockAudit = {
  logAccess: jest.fn().mockResolvedValue(undefined),
};

describe('PublicCallsController — LGPD consent', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicCallsController],
      providers: [
        { provide: Citizen156Service, useValue: mockService },
        { provide: TenantsService, useValue: mockTenants },
        { provide: CacheService, useValue: mockCache },
        { provide: LgpdAuditService, useValue: mockAudit },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject call with personal data but no consent', async () => {
    const res = await request(app.getHttpServer())
      .post('/public/calls')
      .send({
        title: 'Buraco na rua',
        category: 'Buracos e Pavimentação',
        reporterName: 'João',
        reporterContact: 'joao@email.com',
      })
      .expect(403);
    expect(res.body.message).toContain('Consentimento');
  });

  it('should accept call with personal data AND consent', async () => {
    const res = await request(app.getHttpServer())
      .post('/public/calls')
      .send({
        title: 'Buraco na rua',
        category: 'Buracos e Pavimentação',
        reporterName: 'João',
        reporterContact: 'joao@email.com',
        lgpdConsent: true,
        lgpdConsentVersion: 'v1.0-2026-05',
      })
      .expect(201);
    expect(res.body.protocolNumber).toBe('PROTO-001');
    expect(mockAudit.logAccess).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CONSENT_RECORDED' }),
    );
  });

  it('should accept call without personal data (no consent needed)', async () => {
    const res = await request(app.getHttpServer())
      .post('/public/calls')
      .send({
        title: 'Lâmpada queimada',
        category: 'Iluminação Pública',
      })
      .expect(201);
    expect(res.body.protocolNumber).toBe('PROTO-001');
  });

  it('should reject call with only name (personal data) and no consent', async () => {
    const res = await request(app.getHttpServer())
      .post('/public/calls')
      .send({
        title: 'Vazamento',
        category: 'Drenagem e Esgoto',
        reporterName: 'Maria',
      })
      .expect(403);
    expect(res.body.message).toContain('Consentimento');
  });
});
