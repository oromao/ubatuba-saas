"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../../src/app.module");
describe('CTM Parcels Integration (T2-PARCEL-E2E backend)', () => {
    let app;
    let tenantId;
    let accessToken;
    let parcelId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        tenantId = 'test-tenant-' + Date.now();
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
            if (!parcelId)
                return;
            const response = await request(app.getHttpServer())
                .get(`/ctm/parcels/${parcelId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('sqlu');
            expect(response.body._id).toBe(parcelId);
        });
        it('03 - Update parcel (edit and persist)', async () => {
            if (!parcelId)
                return;
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
            if (!parcelId)
                return;
            const response = await request(app.getHttpServer())
                .get(`/ctm/parcels/${parcelId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            expect(response.body._id).toBe(parcelId);
            expect(response.body).toHaveProperty('mainAddress');
        });
        it('05 - Get parcel history (audit trail)', async () => {
            if (!parcelId)
                return;
            const response = await request(app.getHttpServer())
                .get(`/ctm/parcels/${parcelId}/history`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            expect(response.body).toBeInstanceOf(Array);
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
            if (response.body.length > 0) {
                response.body.forEach((p) => {
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
//# sourceMappingURL=parcels.integration.spec.js.map