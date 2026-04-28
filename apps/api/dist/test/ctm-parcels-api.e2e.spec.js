"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../src/common/utils/mvt.util', () => ({
    createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const parcels_controller_1 = require("../src/modules/ctm/parcels/parcels.controller");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const geometry_service_1 = require("../src/modules/ctm/geometry.service");
describe('ParcelsController (api smoke)', () => {
    let app;
    const parcelsServiceMock = {
        list: jest.fn().mockResolvedValue([
            {
                id: 'parcel-1',
                sqlu: '123.456.789',
                inscription: '0001.001.0001-01',
                inscricaoImobiliaria: '0001.001.0001-01',
                mainAddress: 'Rua A, 123',
                status: 'ATIVO',
            },
        ]),
        getStatistics: jest.fn().mockResolvedValue({
            total: 1,
            official: 1,
            demo: 0,
            withSqlu: 1,
            withIptu: 1,
            totalValorVenal: 1000,
            totalIptuLancado: 0,
            totalIptuPago: 0,
            totalIptuEmAberto: 0,
            inadimplentes: 0,
            taxaAdimplencia: 100,
            byZone: { URBANA: 1 },
            byStatus: { QUITADO: 1 },
        }),
        listPendencias: jest.fn().mockResolvedValue([{ tipo: 'IPTU', total: 1 }]),
        geojson: jest.fn().mockResolvedValue({
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
                    properties: { parcelId: 'parcel-1', featureType: 'parcel' },
                },
            ],
        }),
        findById: jest.fn().mockResolvedValue({
            id: 'parcel-1',
            sqlu: '123.456.789',
            inscription: '0001.001.0001-01',
            mainAddress: 'Rua A, 123',
        }),
        getSummary: jest.fn().mockResolvedValue({
            parcel: { id: 'parcel-1' },
            relatedBuildingsCount: 0,
            relatedInfrastructureCount: 0,
            relatedSocioeconomicCount: 0,
            logradouro: null,
        }),
        getHistory: jest.fn().mockResolvedValue([]),
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
            next();
        });
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('smokes the list, statistics and geojson routes', async () => {
        await request(app.getHttpServer())
            .get('/ctm/parcels')
            .query({ projectId: 'proj-1' })
            .expect(200)
            .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].sqlu).toBe('123.456.789');
        });
        await request(app.getHttpServer())
            .get('/ctm/parcels/statistics')
            .query({ projectId: 'proj-1' })
            .expect(200)
            .expect((res) => {
            expect(res.body.total).toBe(1);
            expect(res.body.official).toBe(1);
        });
        await request(app.getHttpServer())
            .get('/ctm/parcels/pendencias')
            .query({ projectId: 'proj-1' })
            .expect(200)
            .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].tipo).toBe('IPTU');
        });
        await request(app.getHttpServer())
            .get('/ctm/parcels/geojson')
            .query({ projectId: 'proj-1' })
            .expect(200)
            .expect((res) => {
            expect(res.body.type).toBe('FeatureCollection');
            expect(res.body.features).toHaveLength(1);
        });
    });
    it('smokes geometry validation contract', async () => {
        await request(app.getHttpServer())
            .post('/ctm/parcels/validate-geometry')
            .send({ geometry: { type: 'Point', coordinates: [-46.305, -23.55] } })
            .expect(201)
            .expect((res) => {
            expect(res.body.valid).toBe(true);
        });
    });
});
//# sourceMappingURL=ctm-parcels-api.e2e.spec.js.map