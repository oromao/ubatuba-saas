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

describe('ParcelsController import contract (api smoke)', () => {
  let app: INestApplication;

  const parcelsServiceMock = {
    importGeojson: jest.fn().mockResolvedValue({
      batchId: 'batch-1',
      inserted: 1,
      updated: 0,
      skipped: 0,
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

  it('sends a geojson import payload to the service contract', async () => {
    const payload = {
      sourceType: 'GEOJSON',
      fileName: 'parcels.geojson',
      upsert: true,
      municipalityName: 'Ubatuba',
      municipalityCode: '3555406',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'parcel-1',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-46.305, -23.55],
                  [-46.304, -23.55],
                  [-46.304, -23.551],
                  [-46.305, -23.551],
                  [-46.305, -23.55],
                ],
              ],
            },
            properties: {
              sqlu: '123.456.789',
              inscricaoImobiliaria: '0001.001.0001-01',
              endereco: 'Rua A',
              numero: '123',
              bairro: 'Centro',
              status: 'ATIVO',
            },
          },
        ],
      },
    };

    const response = await request(app.getHttpServer())
      .post('/ctm/parcels/import')
      .query({ projectId: 'proj-1' })
      .send(payload)
      .expect(201);

    expect(response.body).toEqual({
      batchId: 'batch-1',
      inserted: 1,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
    });
    expect(parcelsServiceMock.importGeojson).toHaveBeenCalledWith(
      'tenant-1',
      'proj-1',
      payload.data,
      'GEOJSON',
      'parcels.geojson',
      true,
      'user-1',
      'Ubatuba',
      '3555406',
    );
  });

});
