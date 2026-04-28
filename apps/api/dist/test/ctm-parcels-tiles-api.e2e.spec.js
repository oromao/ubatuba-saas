"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const parcels_controller_1 = require("../src/modules/ctm/parcels/parcels.controller");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const geometry_service_1 = require("../src/modules/ctm/geometry.service");
jest.mock('../src/common/utils/mvt.util', () => ({
    createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));
describe('ParcelsController tile contract (api smoke)', () => {
    let app;
    const parcelsServiceMock = {
        vectorTiles: jest.fn().mockResolvedValue(Buffer.from('mock-tile')),
    };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [parcels_controller_1.ParcelsController],
            providers: [
                { provide: parcels_service_1.ParcelsService, useValue: parcelsServiceMock },
                { provide: parcel_buildings_service_1.ParcelBuildingsService, useValue: { upsert: jest.fn() } },
                { provide: parcel_socioeconomic_service_1.ParcelSocioeconomicService, useValue: { upsert: jest.fn() } },
                { provide: parcel_infrastructure_service_1.ParcelInfrastructureService, useValue: { upsert: jest.fn() } },
                { provide: geometry_service_1.GeometryService, useValue: { validateGeometry: jest.fn().mockReturnValue({ valid: true }) } },
            ],
        }).compile();
        app = moduleRef.createNestApplication();
        app.use((req, _res, next) => {
            req.tenantId = 'tenant-1';
            req.user = { sub: 'user-1', role: 'ADMIN' };
            next();
        });
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('serves MVT tiles for the built-in parcels layer', async () => {
        const response = await request(app.getHttpServer())
            .get('/ctm/parcels/tiles/14/1234/5678.pbf')
            .query({ projectId: 'proj-1' })
            .buffer(true)
            .parse(((res, callback) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
        }))
            .expect(200);
        expect(Buffer.isBuffer(response.body)).toBe(true);
        expect(response.body.toString()).toBe('mock-tile');
        expect(parcelsServiceMock.vectorTiles).toHaveBeenCalledWith('tenant-1', 'proj-1', 14, 1234, 5678);
    });
});
//# sourceMappingURL=ctm-parcels-tiles-api.e2e.spec.js.map