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

describe('ParcelsController tile contract (api smoke)', () => {
  let app: INestApplication;

  const parcelsServiceMock = {
    vectorTiles: jest.fn().mockResolvedValue(Buffer.from('mock-tile')),
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

  it('serves MVT tiles for the built-in parcels layer', async () => {
    const response = await request(app.getHttpServer())
      .get('/ctm/parcels/tiles/14/1234/5678.pbf')
      .query({ projectId: 'proj-1' })
      .buffer(true)
      .parse(((res: Response, callback: (err: Error | null, body?: Buffer) => void) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      }) as any)
      .expect(200);

    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.toString()).toBe('mock-tile');
    expect(parcelsServiceMock.vectorTiles).toHaveBeenCalledWith('tenant-1', 'proj-1', 14, 1234, 5678);
  });
});
