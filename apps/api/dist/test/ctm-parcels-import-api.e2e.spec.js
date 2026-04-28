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
describe('ParcelsController import contract (api smoke)', () => {
    let app;
    const parcelsServiceMock = {
        importGeojson: jest.fn().mockResolvedValue({
            batchId: 'batch-1',
            inserted: 1,
            updated: 0,
            skipped: 0,
            errors: 0,
            errorDetails: [],
        }),
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
    it('sends a geojson import payload to the service contract', async () => {
        const payload = {
            sourceType: 'GEOJSON',
            fileName: 'parcels.geojson',
            upsert: true,
            municipalityName: 'Ubatuba',
            municipalityCode: '3555406',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: 'parcel-1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-46.305, -23.55],
                                    [-46.304, -23.55],
                                    [-46.304, -23.551],
                                    [-46.305, -23.551],
                                    [-46.305, -23.55],
                                ],
                            ],
                        },
                        properties: {
                            sqlu: '123.456.789',
                            inscricaoImobiliaria: '0001.001.0001-01',
                            endereco: 'Rua A',
                            numero: '123',
                            bairro: 'Centro',
                            status: 'ATIVO',
                        },
                    },
                ],
            },
        };
        const response = await request(app.getHttpServer())
            .post('/ctm/parcels/import')
            .query({ projectId: 'proj-1' })
            .send(payload)
            .expect(201);
        expect(response.body).toEqual({
            batchId: 'batch-1',
            inserted: 1,
            updated: 0,
            skipped: 0,
            errors: 0,
            errorDetails: [],
        });
        expect(parcelsServiceMock.importGeojson).toHaveBeenCalledWith('tenant-1', 'proj-1', payload.data, 'GEOJSON', 'parcels.geojson', true, 'user-1', 'Ubatuba', '3555406');
    });
});
//# sourceMappingURL=ctm-parcels-import-api.e2e.spec.js.map