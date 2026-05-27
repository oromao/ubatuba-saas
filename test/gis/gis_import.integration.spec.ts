import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GisController } from '../../apps/api/src/modules/gis/gis.controller';
import { importFile } from '../../src/gis/import_module';

jest.mock('../../src/gis/import_module', () => ({
  importFile: jest.fn(),
}));

describe('GisController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [GisController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /gis/import returns GeoJSON and warnings', async () => {
    const mockResult = { geojson: { type: 'FeatureCollection', features: [] }, warnings: ['test warning'] };
    (importFile as jest.Mock).mockResolvedValueOnce(mockResult);
    const payload = { fileBase64: Buffer.from('dummy').toString('base64'), filename: 'test.geojson' };
    const response = await request(app.getHttpServer())
      .post('/gis/import')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual(mockResult);
    expect(importFile).toHaveBeenCalledWith(expect.any(Buffer), 'test.geojson');
  });
});
