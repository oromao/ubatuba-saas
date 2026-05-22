import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ShapefileController } from '../src/modules/ctm/parcels/shapefile.controller';
import { ShapefileService } from '../src/modules/ctm/parcels/shapefile.service';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';

const mockShapefile = {
  parse: jest.fn().mockRejectedValue(new Error('not called')),
};

const mockParcels = {
  importGeojson: jest.fn().mockResolvedValue({ imported: 5, batchId: 'batch-1' }),
};

describe('ShapefileController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShapefileController],
      providers: [
        { provide: ShapefileService, useValue: mockShapefile },
        { provide: ParcelsService, useValue: mockParcels },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /ctm/parcels/import/shp should reject missing file', async () => {
    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import/shp')
      .expect(400);
    expect(res.body.message).toContain('Arquivo não enviado');
  });

  it('POST /ctm/parcels/import/shp should accept .shp file', async () => {
    mockShapefile.parse.mockResolvedValueOnce({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { sqlu: 'TEST' } }],
    });

    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import/shp')
      .attach('file', Buffer.from('fake-shp-content'), 'test.shp')
      .expect(201);
    expect(res.body.imported).toBe(5);
    expect(mockParcels.importGeojson).toHaveBeenCalledWith(
      'demo',
      undefined,
      expect.objectContaining({ type: 'FeatureCollection' }),
      'SHAPEFILE',
      'test.shp',
      true,
      undefined,
    );
  });

  it('POST /ctm/parcels/import/shp should accept .zip file', async () => {
    mockShapefile.parse.mockResolvedValueOnce({
      type: 'FeatureCollection',
      features: [],
    });

    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import/shp')
      .attach('file', Buffer.from('fake-zip-content'), 'parcels.zip')
      .expect(201);
    expect(res.body.imported).toBe(5);
  });

  it('POST /ctm/parcels/import/shp should handle parse errors', async () => {
    mockShapefile.parse.mockRejectedValueOnce(new Error('Invalid shapefile'));

    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import/shp')
      .attach('file', Buffer.from('bad-data'), 'test.shp')
      .expect(500);
  });
});
