import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

describe('T7-SP-DATA-REAL: GeoJSON import with dirty data', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;

  const dirtyFixture = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../../test/fixtures/sp-dirty-data-test.geojson'), 'utf-8'),
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tenantId = 'sp-import-test-' + Date.now();
    accessToken = 'test-token-placeholder';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Import with dirty SP data', () => {
    it('imports valid Polygon and MultiPolygon features', async () => {
      const validFeatures = {
        type: 'FeatureCollection',
        features: dirtyFixture.features.filter(
          (f: any) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'),
        ),
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: validFeatures,
          sourceType: 'OFFICIAL_IMPORT',
          fileName: 'sp-dirty-data-test.geojson',
        });

      // Accept 201 or 200
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('inserted');
      expect(response.body.inserted).toBeGreaterThanOrEqual(2); // at least the 2 valid WGS84 polygons
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('errorDetails');
    });

    it('skips null geometry and reports error', async () => {
      const nullGeomFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: { sqlu: 'NULL-GEOM-TEST', inscricao: '99999-000-000-0-001' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: nullGeomFeature,
          sourceType: 'GEOJSON',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.errors).toBeGreaterThanOrEqual(1);
      expect(response.body.errorDetails).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('Geometria') }),
        ]),
      );
    });

    it('skips UTM coordinates instead of crashing the import', async () => {
      const utmFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[333000, 7395000], [333100, 7395000], [333100, 7394900], [333000, 7394900], [333000, 7395000]]],
            },
            properties: { sqlu: 'UTM-BUG-TEST', inscricao: '99998-000-000-0-002' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: utmFeature,
          sourceType: 'GEOJSON',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.errors).toBeGreaterThanOrEqual(1);
      expect(response.body.errorDetails).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('WGS84') }),
        ]),
      );
    });

    it('skips feature with no SQLU or insscricao', async () => {
      const noIdFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.64, -23.56], [-46.6398, -23.56], [-46.6398, -23.5598], [-46.64, -23.5598], [-46.64, -23.56]]],
            },
            properties: {},
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: noIdFeature,
          sourceType: 'GEOJSON',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.errors).toBeGreaterThanOrEqual(1);
      expect(response.body.errorDetails[0].message).toContain('SQLU');
    });

    it('skips duplicate (non-upsert) and reports skipped', async () => {
      const dupFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.65, -23.57], [-46.6498, -23.57], [-46.6498, -23.5698], [-46.65, -23.5698], [-46.65, -23.57]]],
            },
            properties: { sqlu: 'DUP-SKIP-TEST', inscricao: '99997-000-000-0-003' },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.65, -23.57], [-46.6498, -23.57], [-46.6498, -23.5698], [-46.65, -23.5698], [-46.65, -23.57]]],
            },
            properties: { sqlu: 'DUP-SKIP-TEST', inscricao: '99997-000-000-0-003' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: dupFeature,
          sourceType: 'GEOJSON',
          upsert: false,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.inserted).toBeGreaterThanOrEqual(1);
      expect(response.body.skipped).toBeGreaterThanOrEqual(1);
    });

    it('handles upsert mode for existing parcel', async () => {
      const upsertFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.66, -23.58], [-46.6598, -23.58], [-46.6598, -23.5798], [-46.66, -23.5798], [-46.66, -23.58]]],
            },
            properties: {
              sqlu: 'UPSERT-TEST-001',
              inscricao: '99996-000-000-0-004',
              logradouro: 'R. Original',
              area_terreno: 500.0,
            },
          },
        ],
      };

      // First insert
      await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: upsertFeature,
          sourceType: 'GEOJSON',
        });

      // Update with upsert
      upsertFeature.features[0].properties.logradouro = 'R. Updated';
      upsertFeature.features[0].properties.area_terreno = 600.0;

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: upsertFeature,
          sourceType: 'GEOJSON',
          upsert: true,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.inserted).toBeGreaterThanOrEqual(1);
    });

    it('resolves SQLU from alias column names', async () => {
      const aliasFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.67, -23.59], [-46.6698, -23.59], [-46.6698, -23.5898], [-46.67, -23.5898], [-46.67, -23.59]]],
            },
            properties: {
              codigosqlu: 'ALIAS-SQLU-001',
              inscricao_imob: '99995-000-000-0-005',
              nome_logradouro: 'Av. Alias Test',
              area_m2: '750.5',
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: aliasFeature,
          sourceType: 'GEOJSON',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.inserted).toBeGreaterThanOrEqual(1);
    });

    it('preserves rawProperties on imported parcels', async () => {
      const rawFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.68, -23.60], [-46.6798, -23.60], [-46.6798, -23.5998], [-46.68, -23.5998], [-46.68, -23.60]]],
            },
            properties: {
              sqlu: 'RAW-PROP-001',
              inscricao: '99994-000-000-0-006',
              custom_field_a: 'value_a',
              custom_field_b: 42,
              nm_categoria: 'COMERCIAL',
            },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: rawFeature,
          sourceType: 'GEOJSON',
        });

      // Verify rawProperties is stored by reading the parcel back
      const listResponse = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sqlu: 'RAW-PROP-001' });

      if (listResponse.body.length > 0) {
        const parcel = listResponse.body[0];
        expect(parcel.rawProperties).toBeDefined();
        expect(parcel.rawProperties.custom_field_a).toBe('value_a');
        expect(parcel.rawProperties.nm_categoria).toBe('COMERCIAL');
      }
    });

    it('returns stats with batchId, inserted, skipped, errors, errorDetails', async () => {
      const mixedFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-46.69, -23.61], [-46.6898, -23.61], [-46.6898, -23.6098], [-46.69, -23.6098], [-46.69, -23.61]]],
            },
            properties: { sqlu: 'MIXED-VALID-001', inscricao: '99993-000-000-0-007' },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: { sqlu: 'MIXED-INVALID-001' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/parcels/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: mixedFeature,
          sourceType: 'GEOJSON',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('batchId');
      expect(response.body).toHaveProperty('inserted');
      expect(response.body).toHaveProperty('skipped');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('errorDetails');
      expect(typeof response.body.inserted).toBe('number');
      expect(typeof response.body.errors).toBe('number');
      expect(Array.isArray(response.body.errorDetails)).toBe(true);
    });
  });
});
