jest.mock('../src/common/utils/mvt.util', () => ({
  createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));

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
import { ShapefileImportService } from '../src/modules/ctm/parcels/shapefile-import.service';

describe('ParcelsController detail smoke', () => {
  let app: INestApplication;

  const parcelsServiceMock = {
    findById: jest.fn().mockResolvedValue({
      id: 'parcel-1',
      sqlu: '123.456.789',
      inscription: '0001.001.0001-01',
      mainAddress: 'Rua A, 123',
    }),
    getSummary: jest.fn().mockResolvedValue({
      parcel: { id: 'parcel-1' },
      relatedBuildingsCount: 0,
      relatedInfrastructureCount: 0,
      relatedSocioeconomicCount: 0,
      logradouro: null,
    }),
    getHistory: jest.fn().mockResolvedValue([{ id: 'audit-1', action: 'CREATE' }]),
    getAuditLog: jest.fn().mockResolvedValue({
      entries: [{ id: 'audit-1', action: 'UPDATE', parcelId: 'parcel-1' }],
      total: 1,
      limit: 50,
      offset: 0,
    }),
    generatePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
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
        { provide: ShapefileImportService, useValue: { parseShpZip: jest.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as { tenantId?: string }).tenantId = 'tenant-1';
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('smokes summary, history and pdf routes', async () => {
    await request(app.getHttpServer())
      .get('/ctm/parcels/parcel-1/summary')
      .query({ projectId: 'proj-1' })
      .expect(200)
      .expect((res) => {
        expect(res.body.parcel.id).toBe('parcel-1');
      });

    await request(app.getHttpServer())
      .get('/ctm/parcels/parcel-1/history')
      .query({ projectId: 'proj-1' })
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].action).toBe('CREATE');
      });

    await request(app.getHttpServer())
      .get('/ctm/parcels/audit')
      .query({ parcelId: 'parcel-1', action: 'UPDATE', limit: '10', offset: '0' })
      .expect(200)
      .expect((res) => {
        expect(res.body.total).toBe(1);
        expect(res.body.entries[0].action).toBe('UPDATE');
      });

    await request(app.getHttpServer())
      .get('/ctm/parcels/parcel-1/pdf')
      .query({ projectId: 'proj-1' })
      .expect(200)
      .expect('Content-Type', /application\/pdf/)
      .expect((res) => {
        expect(String(res.text ?? '') || res.body.toString()).toContain('%PDF-1.4');
      });
  });
});
