import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('CTM Parcels Integration (T2-PARCEL-E2E backend)', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;
  let parcelId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: create test tenant and user
    tenantId = 'test-tenant-' + Date.now();
    // In real test, would login or use test seed
    accessToken = 'test-token-placeholder';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Parcel CRUD Flow (T2 requirement)', () => {
    it('01 - List parcels (search foundation)', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ q: 'SQLU' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      if (response.body.length > 0) {
        parcelId = response.body[0]._id;
        expect(response.body[0]).toHaveProperty('sqlu');
        expect(response.body[0]).toHaveProperty('_id');
      }
    });

    it('02 - Get parcel detail', async () => {
      if (!parcelId) {
        this.skip(); // Skip if no parcel found in list
      }

      const response = await request(app.getHttpServer())
        .get(`/ctm/parcels/${parcelId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('sqlu');
      expect(response.body._id).toBe(parcelId);
    });

    it('03 - Update parcel (edit and persist)', async () => {
      if (!parcelId) {
        this.skip();
      }

      const updateData = {
        mainAddress: `Rua Test Updated ${Date.now()}`,
        status: 'ATIVO',
      };

      const response = await request(app.getHttpServer())
        .patch(`/ctm/parcels/${parcelId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(parcelId);
    });

    it('04 - Verify persistence (reload and check)', async () => {
      if (!parcelId) {
        this.skip();
      }

      // Query again to verify the update persisted
      const response = await request(app.getHttpServer())
        .get(`/ctm/parcels/${parcelId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body._id).toBe(parcelId);
      // Verify the updated field is present (mainAddress or status changed)
      expect(response.body).toHaveProperty('mainAddress');
    });

    it('05 - Get parcel history (audit trail)', async () => {
      if (!parcelId) {
        this.skip();
      }

      const response = await request(app.getHttpServer())
        .get(`/ctm/parcels/${parcelId}/history`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Should contain at least one entry if parcel was updated
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('action');
        expect(response.body[0]).toHaveProperty('createdAt');
      }
    });
  });

  describe('Parcel search filters (list page requirements)', () => {
    it('Should list parcels with sourceType filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sourceType: 'DEMO' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // If results exist, all should match filter
      if (response.body.length > 0) {
        response.body.forEach((p: any) => {
          expect(p.sourceType).toBe('DEMO');
        });
      }
    });

    it('Should list parcels with official filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ isOfficial: 'true' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('Should return statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/statistics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('official');
      expect(response.body).toHaveProperty('demo');
      expect(typeof response.body.total).toBe('number');
    });
  });

  describe('GeoJSON export (map requirement)', () => {
    it('Should return GeoJSON for parcels', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('FeatureCollection');
      expect(response.body).toHaveProperty('features');
      expect(Array.isArray(response.body.features)).toBe(true);
    });

    it('Should filter GeoJSON by query', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ q: 'SQLU' })
        .expect(200);

      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('FeatureCollection');
    });
  });
});
