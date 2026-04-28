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
describe('ParcelsController csv enrichment import contract (api smoke)', () => {
    let app;
    const parcelsServiceMock = {
        importFromCsvEnrichment: jest.fn().mockResolvedValue({
            batchId: 'batch-csv-1',
            processed: 1,
            updated: 1,
            notFound: 0,
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
    it('sends a csv import payload to the enrichment contract', async () => {
        const csv = [
            'sqlu,endereco,bairro,areaTerreno,statusIPTU',
            '123.456.789,Rua A,Centro,250,QUITADO',
        ].join('\n');
        const response = await request(app.getHttpServer())
            .post('/ctm/parcels/import-csv')
            .query({ projectId: 'proj-1' })
            .send({ csv })
            .expect(201);
        expect(response.body).toEqual({
            batchId: 'batch-csv-1',
            processed: 1,
            updated: 1,
            notFound: 0,
            errors: 0,
            errorDetails: [],
        });
        expect(parcelsServiceMock.importFromCsvEnrichment).toHaveBeenCalledWith('tenant-1', 'proj-1', csv, 'CSV_ENRICHMENT', undefined, undefined, 'user-1');
    });
    it('sends an explicit enrichment payload to the service contract', async () => {
        const csv = [
            'sqlu,endereco,bairro,zoneamento,areaTerreno',
            '123.456.789,Rua B,Centro,MISTO,300',
        ].join('\n');
        const response = await request(app.getHttpServer())
            .post('/ctm/parcels/import-enrichment')
            .query({ projectId: 'proj-2' })
            .send({
            csv,
            sourceType: 'CSV_ENRICHMENT',
            fileName: 'enrichment.csv',
            columnMapping: { sqlu: 'sqlu', endereco: 'endereco', bairro: 'bairro' },
        })
            .expect(201);
        expect(response.body).toEqual({
            batchId: 'batch-csv-1',
            processed: 1,
            updated: 1,
            notFound: 0,
            errors: 0,
            errorDetails: [],
        });
        expect(parcelsServiceMock.importFromCsvEnrichment).toHaveBeenCalledWith('tenant-1', 'proj-2', csv, 'CSV_ENRICHMENT', 'enrichment.csv', { sqlu: 'sqlu', endereco: 'endereco', bairro: 'bairro' }, 'user-1');
    });
});
//# sourceMappingURL=ctm-parcels-import-csv-api.e2e.spec.js.map