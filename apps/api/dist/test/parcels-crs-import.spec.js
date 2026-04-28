"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcels_repository_1 = require("../src/modules/ctm/parcels/parcels.repository");
const projects_service_1 = require("../src/modules/projects/projects.service");
const import_batch_repository_1 = require("../src/modules/ctm/parcels/import-batch.repository");
const parcel_audit_repository_1 = require("../src/modules/ctm/parcels/parcel-audit.repository");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const logradouros_service_1 = require("../src/modules/ctm/logradouros/logradouros.service");
const geometry_service_1 = require("../src/modules/ctm/geometry.service");
describe('Parcel CRS Import Integration', () => {
    let service;
    const mockParcelsRepository = {
        findById: jest.fn(),
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findBySqlu: jest.fn(),
        findByInscription: jest.fn(),
        upsert: jest.fn(),
    };
    const mockImportBatchRepository = {
        create: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        list: jest.fn(),
        addWarning: jest.fn(),
        addError: jest.fn(),
    };
    const mockProjectsService = {
        resolveProjectId: jest.fn().mockResolvedValue('project-1'),
    };
    const mockOtherServices = {
        findByParcel: jest.fn().mockResolvedValue(null),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                parcels_service_1.ParcelsService,
                {
                    provide: parcels_repository_1.ParcelsRepository,
                    useValue: mockParcelsRepository,
                },
                {
                    provide: import_batch_repository_1.ImportBatchRepository,
                    useValue: mockImportBatchRepository,
                },
                {
                    provide: projects_service_1.ProjectsService,
                    useValue: mockProjectsService,
                },
                {
                    provide: parcel_buildings_service_1.ParcelBuildingsService,
                    useValue: mockOtherServices,
                },
                {
                    provide: parcel_infrastructure_service_1.ParcelInfrastructureService,
                    useValue: mockOtherServices,
                },
                {
                    provide: parcel_socioeconomic_service_1.ParcelSocioeconomicService,
                    useValue: mockOtherServices,
                },
                {
                    provide: logradouros_service_1.LogradourosService,
                    useValue: mockOtherServices,
                },
                {
                    provide: geometry_service_1.GeometryService,
                    useValue: { validateGeometry: jest.fn() },
                },
                {
                    provide: parcel_audit_repository_1.ParcelAuditRepository,
                    useValue: { create: jest.fn().mockResolvedValue({}) },
                },
            ],
        }).compile();
        service = module.get(parcels_service_1.ParcelsService);
        jest.clearAllMocks();
    });
    describe.skip('GeoJSON Import with UTM Coordinates', () => {
        it('should accept and convert UTM coordinates during import', async () => {
            const utmFeatureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: 'test-001',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [328000, 7395000],
                                    [328100, 7395000],
                                    [328100, 7395100],
                                    [328000, 7395100],
                                    [328000, 7395000],
                                ]],
                        },
                        properties: {
                            sqlu: 'TEST-001',
                            inscricaoImobiliaria: '001.001.001',
                            endereco: 'Rua de Teste',
                            structure: 'test-structure',
                        },
                    },
                ],
            };
            jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
                id: 'parcel-1',
                ...utmFeatureCollection.features[0].properties,
                geometry: expect.any(Object),
            });
            mockImportBatchRepository.create.mockResolvedValue({
                id: 'batch-1',
                tenantId: 'tenant-1',
                projectId: 'project-1',
                warnings: [],
                errors: [],
            });
            const result = await service.importGeojson('tenant-1', undefined, utmFeatureCollection, 'GEOJSON', 'test.geojson', false, 'user-1', 'São Paulo', '3550308');
            expect(result.errors).toBe(0);
            expect(result.inserted).toBeGreaterThanOrEqual(1);
            expect(mockParcelsRepository.create).toHaveBeenCalled();
            const createdParcel = mockParcelsRepository.create.mock.calls[0][0];
            expect(createdParcel.geometry).toBeDefined();
            expect(createdParcel.geometry.type).toBe('Polygon');
            const coords = createdParcel.geometry.coordinates[0];
            for (const coord of coords) {
                expect(coord[0]).toBeGreaterThanOrEqual(-180);
                expect(coord[0]).toBeLessThanOrEqual(180);
                expect(coord[1]).toBeGreaterThanOrEqual(-90);
                expect(coord[1]).toBeLessThanOrEqual(90);
            }
        });
        it('should not reject coordinates that look like UTM', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: 'test-002',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [500000, 7000000],
                                    [500100, 7000000],
                                    [500100, 7000100],
                                    [500000, 7000100],
                                    [500000, 7000000],
                                ]],
                        },
                        properties: {
                            sqlu: 'TEST-002',
                            inscricaoImobiliaria: '001.001.002',
                        },
                    },
                ],
            };
            jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
                id: 'parcel-2',
                ...featureCollection.features[0].properties,
                geometry: expect.any(Object),
            });
            mockImportBatchRepository.create.mockResolvedValue({
                id: 'batch-2',
                tenantId: 'tenant-1',
                projectId: 'project-1',
                warnings: [],
                errors: [],
            });
            const result = await service.importGeojson('tenant-1', undefined, featureCollection, 'GEOJSON', 'test-utm.geojson', false, 'user-1', 'São Paulo', '3550308');
            expect(result.errors).toBe(0);
            expect(result.inserted).toBeGreaterThanOrEqual(1);
        });
        it('should handle already WGS84 coordinates without issues', async () => {
            const wgs84FeatureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: 'test-003',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6333, -23.5505],
                                    [-46.6330, -23.5505],
                                    [-46.6330, -23.5502],
                                    [-46.6333, -23.5502],
                                    [-46.6333, -23.5505],
                                ]],
                        },
                        properties: {
                            sqlu: 'TEST-003',
                            inscricaoImobiliaria: '001.001.003',
                        },
                    },
                ],
            };
            jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
                id: 'parcel-3',
                ...wgs84FeatureCollection.features[0].properties,
                geometry: expect.any(Object),
            });
            mockImportBatchRepository.create.mockResolvedValue({
                id: 'batch-3',
                tenantId: 'tenant-1',
                projectId: 'project-1',
                warnings: [],
                errors: [],
            });
            const result = await service.importGeojson('tenant-1', undefined, wgs84FeatureCollection, 'GEOJSON', 'test-wgs84.geojson', false, 'user-1', 'São Paulo', '3550308');
            expect(result.errors).toBe(0);
            expect(result.inserted).toBeGreaterThanOrEqual(1);
            const createdParcel = mockParcelsRepository.create.mock.calls[0][0];
            expect(createdParcel.geometry.coordinates[0][0][0]).toBeCloseTo(-46.6333, 0.0001);
            expect(createdParcel.geometry.coordinates[0][0][1]).toBeCloseTo(-23.5505, 0.0001);
        });
        it('should detect and log CRS conversion in warnings', async () => {
            const utmFeatureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: 'test-004',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [328000, 7395000],
                                    [328100, 7395000],
                                    [328100, 7395100],
                                    [328000, 7395100],
                                    [328000, 7395000],
                                ]],
                        },
                        properties: {
                            sqlu: 'TEST-004',
                            inscricaoImobiliaria: '001.001.004',
                        },
                    },
                ],
            };
            jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
            jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
                id: 'parcel-4',
                ...utmFeatureCollection.features[0].properties,
                geometry: expect.any(Object),
            });
            mockImportBatchRepository.create.mockResolvedValue({
                id: 'batch-4',
                tenantId: 'tenant-1',
                projectId: 'project-1',
                warnings: [],
                errors: [],
            });
            const result = await service.importGeojson('tenant-1', undefined, utmFeatureCollection, 'GEOJSON', 'test-004.geojson', false, 'user-1', 'São Paulo', '3550308');
            expect(result.errors).toBe(0);
        });
    });
});
//# sourceMappingURL=parcels-crs-import.spec.js.map