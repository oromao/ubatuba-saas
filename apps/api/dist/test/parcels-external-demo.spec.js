"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcels_repository_1 = require("../src/modules/ctm/parcels/parcels.repository");
const import_batch_repository_1 = require("../src/modules/ctm/parcels/import-batch.repository");
const projects_service_1 = require("../src/modules/projects/projects.service");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const logradouros_service_1 = require("../src/modules/ctm/logradouros/logradouros.service");
const parcel_audit_repository_1 = require("../src/modules/ctm/parcels/parcel-audit.repository");
describe('ParcelsService External Demo Import', () => {
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
    describe('importGeojson with DEMO_EXTERNAL sourceType', () => {
        it('should import São Paulo GeoJSON with municipalityName', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            sql: '0010103001',
                            inscricao: '1003001000',
                            logradouro: 'Rua Example',
                            numero: '100',
                            bairro: 'Vila Example',
                            area: 250,
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', 'sao_paulo_lotes.geojson', false, '66f1f77a67e30f9f62000003', 'São Paulo', '3550308');
            expect(result.inserted).toBe(1);
            expect(result.errors).toBe(0);
            expect(mockRepository.create).toHaveBeenCalled();
        });
        it('should set municipalityName when sourceType is DEMO_EXTERNAL', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            cod_sql: '0010103001',
                            inscricao: '1003001000',
                            nome_logr: 'Avenida Paulista',
                            num: '1000',
                            bairro_nome: 'Bela Vista',
                            area_m2: 500,
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', undefined, false, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(1);
            const createCall = mockRepository.create.mock.calls[0][0];
            expect(createCall.municipalityName).toBe('São Paulo');
            expect(createCall.isOfficial).toBe(false);
            expect(createCall.sourceType).toBe('DEMO_EXTERNAL');
            expect(createCall.enderecoPrincipal.cidade).toBe('São Paulo');
        });
        it('should map setor/quadra/lote from GeoJSON properties', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            sql: '0010103001',
                            setor: '001',
                            quadra: '010',
                            lote: '003',
                            area_lote: 300,
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', 'test.geojson', false, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(1);
            const createCall = mockRepository.create.mock.calls[0][0];
            expect(createCall.setor).toBe('001');
            expect(createCall.quadra).toBe('010');
            expect(createCall.lote).toBe('003');
            expect(createCall.sqlu).toBe('0010103001');
        });
        it('should handle OFFICIAL_SAMPLE sourceType correctly', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            sqlu: 'OFFICIAL-SP-001',
                            inscricao: '35503080001',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'OFFICIAL_SAMPLE', 'geosampa_sample.geojson', false, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(1);
            const createCall = mockRepository.create.mock.calls[0][0];
            expect(createCall.sourceType).toBe('OFFICIAL_SAMPLE');
            expect(createCall.isOfficial).toBe(false);
            expect(createCall.municipalityName).toBe('São Paulo');
        });
        it('should upsert when parcel already exists', async () => {
            mockRepository.findBySqlu = jest.fn().mockResolvedValue({ id: 'existing-parcel', sqlu: '0010103001' });
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            sql: '0010103001',
                            area: 350,
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', 'test.geojson', true, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(1);
            expect(mockRepository.update).toHaveBeenCalled();
        });
        it('should skip invalid geometry features', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: null,
                        properties: {
                            sql: '0010103001',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', 'test.geojson', false, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(0);
            expect(result.errors).toBe(0);
            expect(result.skipped).toBe(1);
        });
        it('should require sqlu or inscription', async () => {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '1',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                    [-46.6, -23.5],
                                    [-46.6, -23.55],
                                    [-46.65, -23.55],
                                    [-46.65, -23.5],
                                    [-46.6, -23.5],
                                ]],
                        },
                        properties: {
                            logradouro: 'Rua Teste',
                        },
                    },
                ],
            };
            const result = await service.importGeojson('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002', featureCollection, 'DEMO_EXTERNAL', 'test.geojson', false, '66f1f77a67e30f9f62000003', 'São Paulo');
            expect(result.inserted).toBe(0);
            expect(result.errors).toBe(1);
        });
    });
});
//# sourceMappingURL=parcels-external-demo.spec.js.map