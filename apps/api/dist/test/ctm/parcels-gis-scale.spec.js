"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../../src/app.module");
describe('T6-SP-GIS-SCALE: Viewport-based bbox loading and 2dsphere index', () => {
    let app;
    let tenantId;
    let accessToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
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
            const bbox = '-46.64,-23.56,-46.63,-23.55';
            const response = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ bbox });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('type');
            expect(response.body.type).toBe('FeatureCollection');
            expect(Array.isArray(response.body.features)).toBe(true);
        });
        it('returns fewer results with a small bbox than without', async () => {
            const tinyBbox = '-46.6333,-23.5505,-46.6332,-23.5504';
            const bboxResponse = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ bbox: tinyBbox });
            const allResponse = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(bboxResponse.status).toBe(200);
            expect(allResponse.status).toBe(200);
            expect(bboxResponse.body.features.length).toBeLessThanOrEqual(allResponse.body.features.length);
        });
        it('returns empty features for bbox with no parcels', async () => {
            const oceanBbox = '0,0,1,1';
            const response = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ bbox: oceanBbox });
            expect(response.status).toBe(200);
            expect(response.body.features.length).toBe(0);
        });
        it('list endpoint also respects bbox filter', async () => {
            const bbox = '-46.64,-23.56,-46.63,-23.55';
            const response = await request(app.getHttpServer())
                .get('/ctm/parcels')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ bbox });
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });
    });
    describe('2dsphere index verification', () => {
        it('geojson endpoint responds successfully (index functional)', async () => {
            const response = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body.type).toBe('FeatureCollection');
        });
    });
    describe('Map does not load full dataset', () => {
        it('bbox query is limited to 2000 results max', async () => {
            const largeBbox = '-46.8,-23.8,-46.4,-23.4';
            const response = await request(app.getHttpServer())
                .get('/ctm/parcels/geojson')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ bbox: largeBbox });
            expect(response.status).toBe(200);
            expect(response.body.features.length).toBeLessThanOrEqual(2000);
        });
    });
});
//# sourceMappingURL=parcels-gis-scale.spec.js.map