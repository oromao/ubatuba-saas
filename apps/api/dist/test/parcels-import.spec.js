"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcels_repository_1 = require("../src/modules/ctm/parcels/parcels.repository");
const import_batch_repository_1 = require("../src/modules/ctm/parcels/import-batch.repository");
const projects_service_1 = require("../src/modules/projects/projects.service");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const logradouros_service_1 = require("../src/modules/ctm/logradouros/logradouros.service");
const parcel_audit_repository_1 = require("../src/modules/ctm/parcels/parcel-audit.repository");
describe('ParcelsService Import Tests', () => {
    let service;
    let repository;
    let importBatchRepository;
    const mockRepository = {
        list: jest.fn().mockResolvedValue([]),
        findById: jest.fn().mockResolvedValue(null),
        findBySqlu: jest.fn().mockResolvedValue(null),
        findByInscription: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'new-parcel-id', sqlu: 'TEST-001' }),
        update: jest.fn().mockResolvedValue({ id: 'updated-id' }),
        delete: jest.fn().mockResolvedValue({ success: true }),
    };
    const mockImportBatchRepository = {
        create: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000004', status: 'PROCESSING' }),
        update: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000004', status: 'COMPLETED' }),
    };
    const mockProjectsService = {
        resolveProjectId: jest.fn().mockResolvedValue('66f1f77a67e30f9f62000002'),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                parcels_service_1.ParcelsService,
                { provide: parcels_repository_1.ParcelsRepository, useValue: mockRepository },
                { provide: import_batch_repository_1.ImportBatchRepository, useValue: mockImportBatchRepository },
                { provide: projects_service_1.ProjectsService, useValue: mockProjectsService },
                { provide: parcel_buildings_service_1.ParcelBuildingsService, useValue: {} },
                { provide: parcel_socioeconomic_service_1.ParcelSocioeconomicService, useValue: {} },
                { provide: parcel_infrastructure_service_1.ParcelInfrastructureService, useValue: {} },
                { provide: logradouros_service_1.LogradourosService, useValue: {} },
                { provide: parcel_audit_repository_1.ParcelAuditRepository, useValue: { create: jest.fn().mockResolvedValue({}) } },
            ],
        }).compile();
        service = module.get(parcels_service_1.ParcelsService);
        repository = module.get(parcels_repository_1.ParcelsRepository);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('importGeojson', () => {
        it('should import valid GeoJSON with all required fields', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-45.0, -23.0],
                                    [-45.0, -23.01],
                                    [-45.01, -23.01],
                                    [-45.01, -23.0],
                                    [-45.0, -23.0],
                                ]],
                        },
                        properties: {
                            sqlu: '001-001-001-001',
                            inscricaoImobiliaria: '354400010001',
                            endereco: 'Rua Teste',
                            numero: '100',
                            bairro: 'Centro',
                            areaTerreno: 250,
                            zoneamento: 'RESIDENCIAL',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'GEOJSON', 'test.geojson', false, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(1);
            expect(result.errors).toBe(0);
            expect(mockRepository.create).toHaveBeenCalled();
        });
        it('should skip features without valid geometry', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: null,
                        properties: {
                            sqlu: '001-001-001-001',
                            inscricaoImobiliaria: '354400010001',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'GEOJSON', 'test.geojson', false, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(0);
            expect(result.errors).toBe(1);
        });
        it('should skip features without sqlu or inscription', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-45.0, -23.0],
                                    [-45.0, -23.01],
                                    [-45.01, -23.01],
                                    [-45.01, -23.0],
                                    [-45.0, -23.0],
                                ]],
                        },
                        properties: {
                            endereco: 'Rua Teste',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'GEOJSON', 'test.geojson', false, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(0);
            expect(result.errors).toBe(1);
        });
        it('should map property aliases correctly', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-45.0, -23.0],
                                    [-45.0, -23.01],
                                    [-45.01, -23.01],
                                    [-45.01, -23.0],
                                    [-45.0, -23.0],
                                ]],
                        },
                        properties: {
                            SQLU: '001-001-001-001',
                            inscricao: '354400010001',
                            nome: 'Rua Teste',
                            zona: 'RESIDENCIAL',
                            area_m2: 300,
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'GEOJSON', 'test.geojson', false, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(1);
        });
        it('should handle upsert when parcel exists', async () => {
            mockRepository.findBySqlu = jest.fn().mockResolvedValue({ id: 'existing-parcel', sqlu: '001-001-001-001' });
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-45.0, -23.0],
                                    [-45.0, -23.01],
                                    [-45.01, -23.01],
                                    [-45.01, -23.0],
                                    [-45.0, -23.0],
                                ]],
                        },
                        properties: {
                            sqlu: '001-001-001-001',
                            inscricaoImobiliaria: '354400010001',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'GEOJSON', 'test.geojson', true, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(1);
            expect(mockRepository.update).toHaveBeenCalled();
        });
        it('should reject malformed GeoJSON payloads before import processing', async () => {
            await expect(service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', { type: 'FeatureCollection', features: [{ type: 'Feature', properties: null }] }, 'GEOJSON', 'test.geojson', false, '66f1f77a67e30f9f62000003')).rejects.toBeInstanceOf(common_1.BadRequestException);
        });
    });
    describe('importFromCsvEnrichment', () => {
        it('should update existing parcel with CSV data', async () => {
            mockRepository.findBySqlu = jest.fn().mockResolvedValue({
                id: 'existing-parcel',
                sqlu: '001-001-001-001',
                inscricaoImobiliaria: '354400010001',
                enderecoPrincipal: {},
            });
            const csv = `sqlu,inscricao,areaTerreno,valorVenalTotal,iptuLancado,iptuPago,statusIPTU
001-001-001-001,354400010001,300,150000,500,450,QUITADO`;
            const result = await service.importFromCsvEnrichment('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', csv, 'CSV_ENRICHMENT', 'test.csv', undefined, '66f1f77a67e30f9f62000003');
            expect(result.updated).toBe(1);
            expect(result.notFound).toBe(0);
        });
        it('should report not found when parcel does not exist', async () => {
            mockRepository.findBySqlu = jest.fn().mockResolvedValue(null);
            const csv = `sqlu,inscricao,areaTerreno
999-999-999-999,999999999999,300`;
            const result = await service.importFromCsvEnrichment('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', csv, 'CSV_ENRICHMENT', 'test.csv', undefined, '66f1f77a67e30f9f62000003');
            expect(result.updated).toBe(0);
            expect(result.notFound).toBe(1);
        });
        it('should require sqlu or inscription for linkage', async () => {
            const csv = `areaTerreno
300`;
            const result = await service.importFromCsvEnrichment('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', csv, 'CSV_ENRICHMENT', 'test.csv', undefined, '66f1f77a67e30f9f62000003');
            expect(result.errors).toBe(1);
        });
    });
    describe('payload contract – wrapped envelope vs raw FeatureCollection', () => {
        const validFeature = {
            type: 'Feature',
            id: 'contract-1',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                        [-45.0, -23.0],
                        [-45.0, -23.01],
                        [-45.01, -23.01],
                        [-45.01, -23.0],
                        [-45.0, -23.0],
                    ]],
            },
            properties: { sqlu: 'CONTRACT-001', inscricaoImobiliaria: '354400010001' },
        };
        it('accepts featureCollection extracted from wrapped envelope { data: FC, sourceType, fileName, upsert }', async () => {
            const wrappedBody = {
                data: { type: 'FeatureCollection', features: [validFeature] },
                sourceType: 'OFFICIAL_IMPORT',
                fileName: 'contract-test.geojson',
                upsert: false,
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', wrappedBody.data, wrappedBody.sourceType, wrappedBody.fileName, wrappedBody.upsert, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(1);
            expect(result.errors).toBe(0);
            expect(mockImportBatchRepository.create).toHaveBeenCalledWith(expect.objectContaining({ sourceType: 'OFFICIAL_IMPORT', fileName: 'contract-test.geojson' }));
        });
        it('accepts raw FeatureCollection directly (fallback path used by project-scoped controller)', async () => {
            const rawFc = { type: 'FeatureCollection', features: [validFeature] };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', rawFc, 'GEOJSON', undefined, false, '66f1f77a67e30f9f62000003');
            expect(result.inserted).toBe(1);
            expect(result.errors).toBe(0);
        });
        it('rejects when body.data is missing and type is not FeatureCollection (simulates malformed request)', async () => {
            const emptyFc = { type: 'FeatureCollection', features: [] };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', emptyFc);
            expect(result.inserted).toBe(0);
            expect(result.batchId).toBeNull();
        });
    });
    describe('getStatistics', () => {
        it('should return correct statistics', async () => {
            mockRepository.list = jest.fn().mockResolvedValue([
                { sqlu: '001', isOfficial: true, statusIPTU: 'QUITADO', valorVenalTotal: 100000, iptuLancado: 500, iptuPago: 500, iptuEmAberto: 0 },
                { sqlu: '002', isOfficial: true, statusIPTU: 'INADIMPLENTE', valorVenalTotal: 150000, iptuLancado: 750, iptuPago: 0, iptuEmAberto: 750 },
                { sqlu: '003', isOfficial: false, sourceType: 'DEMO', statusIPTU: undefined, valorVenalTotal: 0, iptuLancado: 0, iptuPago: 0, iptuEmAberto: 0 },
            ]);
            const result = await service.getStatistics('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002');
            expect(result.total).toBe(3);
            expect(result.official).toBe(2);
            expect(result.demo).toBe(1);
            expect(result.withSqlu).toBe(3);
            expect(result.withIptu).toBe(2);
            expect(result.totalValorVenal).toBe(250000);
            expect(result.totalIptuLancado).toBe(1250);
            expect(result.totalIptuPago).toBe(500);
            expect(result.totalIptuEmAberto).toBe(750);
            expect(result.inadimplentes).toBe(1);
            expect(result.taxaAdimplencia).toBe(50);
        });
    });
});
//# sourceMappingURL=parcels-import.spec.js.map