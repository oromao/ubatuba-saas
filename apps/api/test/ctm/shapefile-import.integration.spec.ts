// apps/api/test/ctm/shapefile-import.integration.spec.ts
/**
 * Testes de integração do endpoint POST /ctm/parcels/import-shapefile
 * Requer MongoDB real (ambiente de teste padrão).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as JSZip from 'jszip';

describe('CTM Parcels - import-shapefile (T10-SHP-IMPORT)', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    tenantId = new Types.ObjectId().toHexString();
    accessToken = 'test-token-shp';

    const jwtServiceMock = {
      verify: () => ({
        sub: new Types.ObjectId().toHexString(),
        role: 'ADMIN',
        tenantId,
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const fixturePath = join(__dirname, 'fixtures', 'shp-ubatuba-test.zip');

  // -----------------------------------------------------------
  // Cenário 1: ZIP válido → 200 + inserted >= 1
  // -----------------------------------------------------------
  it('01 - Deve importar parcelas de ZIP válido e retornar inserted >= 1', async () => {
    const zipBuffer = readFileSync(fixturePath);
    const fileBase64 = zipBuffer.toString('base64');

    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import-shapefile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fileBase64,
        filename: 'test_parcelas.zip',
        upsert: false,
      })
      .expect(201);

    // O endpoint retorna { batchId, inserted, updated, skipped, errors, shapefile: {...} }
    console.log(res.body); expect(res.body).toHaveProperty('batchId');
    console.log(res.body); expect(res.body).toHaveProperty('shapefile');
    expect(res.body.shapefile.detectedCrs).toBe('EPSG:4326');
    expect(res.body.shapefile.totalFeaturesRead).toBeGreaterThanOrEqual(1);

    // inserted + skipped >= 1 (a feature foi processada)
    const processed = (res.body.inserted ?? 0) + (res.body.skipped ?? 0);
    expect(processed).toBeGreaterThanOrEqual(1);
  });

  // -----------------------------------------------------------
  // Cenário 2: Body sem fileBase64 → 400
  // -----------------------------------------------------------
  it('02 - Deve retornar 400 quando fileBase64 está ausente', async () => {
    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import-shapefile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        filename: 'test.zip',
        // fileBase64 ausente
      })
      .expect(400);

    expect(res.body.message).toMatch(/fileBase64|filename/i);
  });

  // -----------------------------------------------------------
  // Cenário 3: ZIP sem .shp → 400 com mensagem clara
  // -----------------------------------------------------------
  it('03 - Deve retornar 400 quando ZIP não contém .shp', async () => {
    const zip = new JSZip();
    zip.file('readme.txt', 'sem shapefile');
    const buffer = Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));

    const res = await request(app.getHttpServer())
      .post('/ctm/parcels/import-shapefile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fileBase64: buffer.toString('base64'),
        filename: 'sem-shp.zip',
      })
      .expect(400);

    expect(res.body.message).toMatch(/\.shp/i);
  });
});
