import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ParcelDocument } from '../../src/modules/ctm/parcels/parcel.schema';
import { ProjectsService } from '../../src/modules/projects/projects.service';

describe('CTM Parcels Integration (T2-PARCEL-E2E backend)', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;
  let parcelId: string;

  beforeAll(async () => {
    tenantId = new Types.ObjectId().toHexString();
    accessToken = 'test-token-placeholder';

    const jwtServiceMock = {
      verify: () => {
        return { sub: new Types.ObjectId().toHexString(), role: 'ADMIN', tenantId };
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Resolver o projectId real do tenant usando o ProjectsService
    const projectsService = moduleFixture.get<ProjectsService>(ProjectsService);
    const resolvedProjectId = await projectsService.resolveProjectId(tenantId, undefined);

    // Criar uma parcela de teste inicial real para que os endpoints de listagem e detalhes funcionem de forma robusta
    const parcelModel = moduleFixture.get<Model<ParcelDocument>>(getModelToken('Parcel'));
    const testParcel = await parcelModel.create({
      tenantId: new Types.ObjectId(tenantId),
      projectId: resolvedProjectId,
      sqlu: 'SQLU-PARCEL-TEST-XYZ',
      inscricaoImobiliaria: '123456',
      mainAddress: 'Rua Test Parcel 123',
      sourceType: 'DEMO',
      isOfficial: true,
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
      },
      status: 'ATIVO'
    });
    parcelId = testParcel._id.toString();
  });

  afterAll(async () => {
    if (app) {
      // Limpar os dados criados no teste
      const parcelModel = app.get<Model<ParcelDocument>>(getModelToken('Parcel'));
      await parcelModel.deleteMany({ tenantId: new Types.ObjectId(tenantId) });

      await app.close();
    }
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
      if (!parcelId) return; // Skip if no parcel found in list

      const response = await request(app.getHttpServer())
        .get(`/ctm/parcels/${parcelId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('sqlu');
      expect(response.body._id).toBe(parcelId);
    });

    it('03 - Update parcel (edit and persist)', async () => {
      if (!parcelId) return;

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
      if (!parcelId) return;

      // Query again to verify the update persisted
      const response = await request(app.getHttpServer())
        .get(`/ctm/parcels/${parcelId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body._id).toBe(parcelId);
      expect(response.body).toHaveProperty('mainAddress');
    });

    it('05 - Get parcel history (audit trail)', async () => {
      if (!parcelId) return;

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

  describe('Validation and Edge Cases (QA-004, QA-008, QA-014)', () => {
    it('Should return 400 when fetching parcel with invalid ObjectId (QA-004)', async () => {
      await request(app.getHttpServer())
        .get('/ctm/parcels/invalid-object-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('Should return 400 when patching parcel with invalid ObjectId (QA-004)', async () => {
      await request(app.getHttpServer())
        .patch('/ctm/parcels/invalid-object-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'ATIVO' })
        .expect(400);
    });

    it('Should return 400 when fetching history with invalid ObjectId (QA-004)', async () => {
      await request(app.getHttpServer())
        .get('/ctm/parcels/invalid-object-id/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('Should return 400 when bbox has invalid format (QA-008)', async () => {
      await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ bbox: '1,2,3' })
        .expect(400);
    });

    it('Should return 400 when bbox has non-numeric coordinates (QA-008)', async () => {
      await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ bbox: 'abc,def,ghi,jkl' })
        .expect(400);
    });

    it('Should return 400 when bbox coordinates are inverted (QA-014)', async () => {
      await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ bbox: '10,20,5,15' })
        .expect(400);
    });
  });
});
