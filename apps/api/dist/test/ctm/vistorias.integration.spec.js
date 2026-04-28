"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../../src/app.module");
describe('CTM Vistorias/Inspections Integration (T2-INSPECT-E2E backend)', () => {
    let app;
    let tenantId;
    let accessToken;
    let parcelId;
    let vistoriaId;
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
    describe('Vistoria CRUD Flow (T2 requirement)', () => {
        beforeAll(async () => {
            const parcelsResponse = await request(app.getHttpServer())
                .get('/ctm/parcels')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            if (parcelsResponse.body.length > 0) {
                parcelId = parcelsResponse.body[0]._id;
            }
        });
        it('01 - Create new vistoria', async () => {
            if (!parcelId)
                return;
            const vistoriaData = {
                tipo: 'LEVANTAMENTO',
                parcelId,
                status: 'PENDENTE',
                observacao: `Test vistoria ${Date.now()}`,
            };
            const response = await request(app.getHttpServer())
                .post('/ctm/vistorias')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(vistoriaData)
                .expect(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('parcelId');
            expect(response.body.parcelId).toBe(parcelId);
            vistoriaId = response.body._id;
        });
        it('02 - List vistorias for parcel', async () => {
            if (!parcelId)
                return;
        });
        const response = await request(app.getHttpServer())
            .get('/ctm/vistorias')
            .set('Authorization', `Bearer ${accessToken}`)
            .query({ parcelId })
            .expect(200);
        expect(response.body).toBeInstanceOf(Array);
        if (vistoriaId) {
            const found = response.body.find((v) => v._id === vistoriaId);
            expect(found).toBeDefined();
        }
    });
    it('03 - Get vistoria detail', async () => {
        if (!vistoriaId)
            return;
    });
    const response = await request(app.getHttpServer())
        .get(`/ctm/vistorias/${vistoriaId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body._id).toBe(vistoriaId);
    expect(response.body).toHaveProperty('status');
});
it('04 - Transition vistoria status', async () => {
    if (!vistoriaId)
        return;
});
const statusTransition = {
    status: 'EM_VALIDACAO',
    observacao: 'Movendo para validação',
};
const response = await request(app.getHttpServer())
    .patch(`/ctm/vistorias/${vistoriaId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(statusTransition)
    .expect(200);
expect(response.body).toHaveProperty('status');
expect(response.body.status).toBe('EM_VALIDACAO');
;
it('05 - Verify status persisted (reload)', async () => {
    if (!vistoriaId)
        return;
});
const response = await request(app.getHttpServer())
    .get(`/ctm/vistorias/${vistoriaId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);
expect(response.body.status).toBe('EM_VALIDACAO');
;
it('06 - Get vistoria history', async () => {
    if (!vistoriaId)
        return;
});
const response = await request(app.getHttpServer())
    .get(`/ctm/vistorias/${vistoriaId}/history`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);
expect(response.body).toBeInstanceOf(Array);
expect(response.body.length).toBeGreaterThanOrEqual(1);
;
;
describe('Vistoria filtering and search', () => {
    it('Should list vistorias with status filter', async () => {
        const response = await request(app.getHttpServer())
            .get('/ctm/vistorias')
            .set('Authorization', `Bearer ${accessToken}`)
            .query({ status: 'PENDENTE' })
            .expect(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    it('Should list vistorias with type filter', async () => {
        const response = await request(app.getHttpServer())
            .get('/ctm/vistorias')
            .set('Authorization', `Bearer ${accessToken}`)
            .query({ tipo: 'LEVANTAMENTO' })
            .expect(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    it('Should search vistorias by text', async () => {
        const response = await request(app.getHttpServer())
            .get('/ctm/vistorias')
            .set('Authorization', `Bearer ${accessToken}`)
            .query({ q: 'test' })
            .expect(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});
;
//# sourceMappingURL=vistorias.integration.spec.js.map