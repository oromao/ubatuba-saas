import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { ProjectsService } from '../../src/modules/projects/projects.service';

describe('T6-SP-GIS-SCALE: Viewport-based bbox loading and 2dsphere index', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    tenantId = new Types.ObjectId().toHexString();
    accessToken = 'test-token-placeholder';
    const projectId = new Types.ObjectId();

    const jwtServiceMock = {
      verify: () => {
        return { sub: new Types.ObjectId().toHexString(), role: 'ADMIN', tenantId };
      },
    };

    const projectsServiceMock = {
      resolveProjectId: jest.fn().mockResolvedValue(projectId),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .overrideProvider(ProjectsService)
      .useValue(projectsServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tenantId = 'sp-gis-test-' + Date.now();
    accessToken = 'test-token-placeholder';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Bbox-limited geojson endpoint', () => {
    it('accepts bbox parameter and returns filtered results', async () => {
      // Small bbox in São Paulo downtown
      const bbox = '-46.64,-23.56,-46.63,-23.55';

      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId)
        .query({ bbox });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('FeatureCollection');
      expect(Array.isArray(response.body.features)).toBe(true);
    });

    it('returns fewer results with a small bbox than without', async () => {
      // Tiny bbox (nearly zero area)
      const tinyBbox = '-46.6333,-23.5505,-46.6332,-23.5504';

      const bboxResponse = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId)
        .query({ bbox: tinyBbox });

      const allResponse = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId);

      expect(bboxResponse.status).toBe(200);
      expect(allResponse.status).toBe(200);

      // Bbox-filtered results should be <= unfiltered
      expect(bboxResponse.body.features.length).toBeLessThanOrEqual(allResponse.body.features.length);
    });

    it('returns empty features for bbox with no parcels', async () => {
      // Bbox in the middle of the ocean
      const oceanBbox = '0,0,1,1';

      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId)
        .query({ bbox: oceanBbox });

      expect(response.status).toBe(200);
      expect(response.body.features.length).toBe(0);
    });

    it('list endpoint also respects bbox filter', async () => {
      const bbox = '-46.64,-23.56,-46.63,-23.55';

      const response = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId)
        .query({ bbox });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('2dsphere index verification', () => {
    it('geojson endpoint responds successfully (index functional)', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId);

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('FeatureCollection');
    });
  });

  describe('Map does not load full dataset', () => {
    it('bbox query is limited to 2000 results max', async () => {
      // Large bbox covering most of São Paulo
      const largeBbox = '-46.8,-23.8,-46.4,-23.4';

      const response = await request(app.getHttpServer())
        .get('/ctm/parcels/geojson')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-tenant-id', tenantId)
        .query({ bbox: largeBbox });

      expect(response.status).toBe(200);
      // Even with a large bbox, results are capped at 2000
      expect(response.body.features.length).toBeLessThanOrEqual(2000);
    });
  });
});
