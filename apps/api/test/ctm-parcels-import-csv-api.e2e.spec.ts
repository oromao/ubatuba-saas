import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request = require('supertest');
import { ParcelsController } from '../src/modules/ctm/parcels/parcels.controller';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { GeometryService } from '../src/modules/ctm/geometry.service';

jest.mock('../src/common/utils/mvt.util', () => ({
  createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));

describe('ParcelsController csv enrichment import contract (api smoke)', () => {
  let app: INestApplication;

  const parcelsServiceMock = {
    importFromCsvEnrichment: jest.fn().mockResolvedValue({
      batchId: 'batch-csv-1',
      processed: 1,
      updated: 1,
      notFound: 0,
      errors: 0,
      errorDetails: [],
    }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ParcelsController],
      providers: [
        { provide: ParcelsService, useValue: parcelsServiceMock },
        { provide: ParcelBuildingsService, useValue: { upsert: jest.fn() } },
        { provide: ParcelSocioeconomicService, useValue: { upsert: jest.fn() } },
        { provide: ParcelInfrastructureService, useValue: { upsert: jest.fn() } },
        { provide: GeometryService, useValue: { validateGeometry: jest.fn().mockReturnValue({ valid: true }) } },
      ],
    }).compile();

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

  it('sends a csv import payload to the enrichment contract', async () => {
    const csv = [
      'sqlu,endereco,bairro,areaTerreno,statusIPTU',
      '123.456.789,Rua A,Centro,250,QUITADO',
    ].join('\n');

    const response = await request(app.getHttpServer())
      .post('/ctm/parcels/import-csv')
      .query({ projectId: 'proj-1' })
      .send({ csv })
      .expect(201);

    expect(response.body).toEqual({
      batchId: 'batch-csv-1',
      processed: 1,
      updated: 1,
      notFound: 0,
      errors: 0,
      errorDetails: [],
    });
    expect(parcelsServiceMock.importFromCsvEnrichment).toHaveBeenCalledWith(
      'tenant-1',
      'proj-1',
      csv,
      'CSV_ENRICHMENT',
      undefined,
      undefined,
      'user-1',
    );
  });

  it('sends an explicit enrichment payload to the service contract', async () => {
    const csv = [
      'sqlu,endereco,bairro,zoneamento,areaTerreno',
      '123.456.789,Rua B,Centro,MISTO,300',
    ].join('\n');

    const response = await request(app.getHttpServer())
      .post('/ctm/parcels/import-enrichment')
      .query({ projectId: 'proj-2' })
      .send({
        csv,
        sourceType: 'CSV_ENRICHMENT',
        fileName: 'enrichment.csv',
        columnMapping: { sqlu: 'sqlu', endereco: 'endereco', bairro: 'bairro' },
      })
      .expect(201);

    expect(response.body).toEqual({
      batchId: 'batch-csv-1',
      processed: 1,
      updated: 1,
      notFound: 0,
      errors: 0,
      errorDetails: [],
    });
    expect(parcelsServiceMock.importFromCsvEnrichment).toHaveBeenCalledWith(
      'tenant-1',
      'proj-2',
      csv,
      'CSV_ENRICHMENT',
      'enrichment.csv',
      { sqlu: 'sqlu', endereco: 'endereco', bairro: 'bairro' },
      'user-1',
    );
  });
});
