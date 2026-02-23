import { INestApplication, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request = require('supertest');
import { ReurbController } from '../src/modules/reurb/reurb.controller';
import { ReurbService } from '../src/modules/reurb/reurb.service';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('ReurbController (api e2e)', () => {
  let app: INestApplication;

  const reurbServiceMock = {
    getTenantConfig: jest.fn().mockResolvedValue({ reurbEnabled: true }),
    upsertTenantConfig: jest.fn().mockResolvedValue({ reurbEnabled: true }),
    createFamily: jest.fn().mockResolvedValue({ id: 'fam-1', familyCode: 'FAM-001' }),
    listFamilies: jest.fn().mockResolvedValue([{ id: 'fam-1', familyCode: 'FAM-001' }]),
    updateFamily: jest.fn().mockResolvedValue({ id: 'fam-1', status: 'APTA' }),
    exportFamiliesCsv: jest.fn().mockResolvedValue({ id: 'del-1', kind: 'BANCO_TABULADO_CSV' }),
    exportFamiliesXlsx: jest.fn().mockResolvedValue({ id: 'del-2', kind: 'BANCO_TABULADO_XLSX' }),
    generatePlanilhaSintese: jest
      .fn()
      .mockRejectedValueOnce(
        new UnprocessableEntityException({
          code: 'REURB_VALIDATION_FAILED',
          errors: [{ code: 'MISSING_REQUIRED_FIELD', message: 'Campo obrigatorio ausente' }],
        }),
      )
      .mockResolvedValueOnce({ id: 'del-3', kind: 'PLANILHA_SINTESE' }),
    createPendency: jest.fn().mockResolvedValue({ id: 'pen-1' }),
    listPendencies: jest.fn().mockResolvedValue([]),
    updatePendencyStatus: jest.fn().mockResolvedValue({ id: 'pen-1', status: 'RESOLVIDA' }),
    getPendencyEvents: jest.fn().mockReturnValue({ on: jest.fn(), off: jest.fn() }),
    requestDocumentUpload: jest.fn().mockResolvedValue({ url: 'http://upload' }),
    completeDocumentUpload: jest.fn().mockResolvedValue({ id: 'fam-1' }),
    generateCartorioPackage: jest.fn().mockResolvedValue({ id: 'del-4', kind: 'PACOTE_CARTORIO_ZIP' }),
    listDeliverables: jest.fn().mockResolvedValue([]),
    getDeliverableDownload: jest.fn().mockResolvedValue({ url: 'http://download' }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ReurbController],
      providers: [
        {
          provide: ReurbService,
          useValue: reurbServiceMock,
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: () => true },
        },
      ],
    })
      .overrideProvider(ReurbService)
      .useValue(reurbServiceMock)
      .compile();

    app = moduleRef.createNestApplication();

    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as { tenantId?: string }).tenantId = 'tenant-1';
      (req as { user?: { sub?: string; role?: string } }).user = { sub: 'user-1', role: 'ADMIN' };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('simulates family registration and planilha generation block/unblock flow', async () => {
    await request(app.getHttpServer())
      .post('/reurb/families')
      .send({ familyCode: 'FAM-001', nucleus: 'N1', responsibleName: 'Maria' })
      .expect(201);

    const blocked = await request(app.getHttpServer())
      .post('/reurb/planilha-sintese/generate')
      .send({})
      .expect(422);

    expect(blocked.body.code).toBe('REURB_VALIDATION_FAILED');

    await request(app.getHttpServer())
      .post('/reurb/pendencies')
      .send({ nucleus: 'N1', documentType: 'RG', missingDocument: 'RG frente', responsible: 'Equipe A' })
      .expect(201);

    const generated = await request(app.getHttpServer())
      .post('/reurb/planilha-sintese/generate')
      .send({})
      .expect(201);

    expect(generated.body.kind).toBe('PLANILHA_SINTESE');
  });
});
