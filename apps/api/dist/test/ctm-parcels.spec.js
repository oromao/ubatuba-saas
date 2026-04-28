"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../src/common/utils/mvt.util', () => ({
    createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const parcels_service_1 = require("../src/modules/ctm/parcels/parcels.service");
const parcels_repository_1 = require("../src/modules/ctm/parcels/parcels.repository");
const parcel_audit_repository_1 = require("../src/modules/ctm/parcels/parcel-audit.repository");
const import_batch_repository_1 = require("../src/modules/ctm/parcels/import-batch.repository");
const projects_service_1 = require("../src/modules/projects/projects.service");
const parcel_buildings_service_1 = require("../src/modules/ctm/parcel-buildings/parcel-buildings.service");
const parcel_infrastructure_service_1 = require("../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service");
const parcel_socioeconomic_service_1 = require("../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service");
const logradouros_service_1 = require("../src/modules/ctm/logradouros/logradouros.service");
const mongoose_1 = require("mongoose");
describe('CTM Parcels Service', () => {
    let service;
    let repository;
    let projectsService;
    let auditRepository;
    let parcelBuildingsServiceMock;
    let parcelInfrastructureServiceMock;
    let parcelSocioeconomicServiceMock;
    let logradourosServiceMock;
    const mockTenantId = new mongoose_1.Types.ObjectId().toHexString();
    const mockProjectId = new mongoose_1.Types.ObjectId().toHexString();
    const mockUserId = new mongoose_1.Types.ObjectId().toHexString();
    const validPolygon = {
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
    };
    const invalidGeometry = {
        type: 'LineString',
        coordinates: [
            [-46.305, -23.55],
            [-46.304, -23.55],
        ],
    };
    const mockParcel = {
        id: 'parcel-001',
        tenantId: mockTenantId,
        projectId: mockProjectId,
        sqlu: '123.45.67.890',
        inscription: '0001.001.0001-01',
        inscricaoImobiliaria: '0001.001.0001-01',
        mainAddress: 'Rua A, 123',
        geometry: validPolygon,
        areaTerreno: 250.5,
        status: 'ATIVO',
        statusCadastral: 'ATIVO',
        workflowStatus: 'PENDENTE',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    };
    const mockParcelWithIssues = {
        ...mockParcel,
        mainAddress: undefined,
        inscription: undefined,
        inscricaoImobiliaria: undefined,
        geometry: undefined,
        areaTerreno: 0,
        status: undefined,
        pendingIssues: [
            'SEM_ENDERECO',
            'SEM_INSCRICAO',
            'SEM_GEOMETRIA',
            'SEM_AREA',
            'SEM_STATUS',
        ],
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                parcels_service_1.ParcelsService,
                {
                    provide: parcels_repository_1.ParcelsRepository,
                    useValue: {
                        list: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: parcel_audit_repository_1.ParcelAuditRepository,
                    useValue: {
                        listByParcel: jest.fn(),
                        listAll: jest.fn(),
                        countAll: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: import_batch_repository_1.ImportBatchRepository,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: projects_service_1.ProjectsService,
                    useValue: {
                        resolveProjectId: jest.fn().mockResolvedValue(mockProjectId),
                    },
                },
                {
                    provide: parcel_buildings_service_1.ParcelBuildingsService,
                    useValue: (parcelBuildingsServiceMock = { findByParcelId: jest.fn(), findByParcel: jest.fn() }),
                },
                {
                    provide: parcel_infrastructure_service_1.ParcelInfrastructureService,
                    useValue: (parcelInfrastructureServiceMock = { findByParcelId: jest.fn(), findByParcel: jest.fn() }),
                },
                {
                    provide: parcel_socioeconomic_service_1.ParcelSocioeconomicService,
                    useValue: (parcelSocioeconomicServiceMock = { findByParcelId: jest.fn(), findByParcel: jest.fn() }),
                },
                {
                    provide: logradouros_service_1.LogradourosService,
                    useValue: (logradourosServiceMock = { findByGeometry: jest.fn(), findById: jest.fn() }),
                },
            ],
        }).compile();
        service = module.get(parcels_service_1.ParcelsService);
        repository = module.get(parcels_repository_1.ParcelsRepository);
        projectsService = module.get(projects_service_1.ProjectsService);
        auditRepository = module.get(parcel_audit_repository_1.ParcelAuditRepository);
    });
    describe('list', () => {
        it('should return list of parcels for tenant and project', async () => {
            jest.spyOn(repository, 'list').mockResolvedValue([mockParcel]);
            const result = await service.list(mockTenantId, mockProjectId);
            expect(result).toEqual([mockParcel]);
            expect(repository.list).toHaveBeenCalledWith(mockTenantId, expect.objectContaining({
                projectId: mockProjectId,
            }));
        });
        it('should filter parcels by inscription', async () => {
            jest.spyOn(repository, 'list').mockResolvedValue([mockParcel]);
            await service.list(mockTenantId, mockProjectId, {
                inscricaoImobiliaria: '0001.001.0001-01',
            });
            expect(repository.list).toHaveBeenCalledWith(mockTenantId, expect.objectContaining({
                inscricaoImobiliaria: '0001.001.0001-01',
            }));
        });
        it('should filter parcels by bbox', async () => {
            jest.spyOn(repository, 'list').mockResolvedValue([mockParcel]);
            await service.list(mockTenantId, mockProjectId, {
                bbox: '-46.31,-23.56,-46.30,-23.55',
            });
            expect(repository.list).toHaveBeenCalledWith(mockTenantId, expect.objectContaining({
                bbox: '-46.31,-23.56,-46.30,-23.55',
            }));
        });
        it('should filter parcels by workflow status', async () => {
            jest.spyOn(repository, 'list').mockResolvedValue([mockParcel]);
            await service.list(mockTenantId, mockProjectId, {
                workflowStatus: 'PENDENTE',
            });
            expect(repository.list).toHaveBeenCalledWith(mockTenantId, expect.objectContaining({
                workflowStatus: 'PENDENTE',
            }));
        });
    });
    describe('listPendencias', () => {
        it('should return parcels with pending issues', async () => {
            jest
                .spyOn(repository, 'list')
                .mockResolvedValue([mockParcelWithIssues]);
            const result = await service.listPendencias(mockTenantId, mockProjectId);
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                parcelId: mockParcelWithIssues.id,
                workflowStatus: 'PENDENTE',
                pendingIssues: expect.arrayContaining([
                    'SEM_ENDERECO',
                    'SEM_INSCRICAO',
                    'SEM_GEOMETRIA',
                    'SEM_AREA',
                    'SEM_STATUS',
                ]),
            });
        });
        it('should compute pending issues if not pre-calculated', async () => {
            const parcelWithoutPrecomputed = {
                ...mockParcelWithIssues,
                pendingIssues: undefined,
            };
            jest
                .spyOn(repository, 'list')
                .mockResolvedValue([parcelWithoutPrecomputed]);
            const result = await service.listPendencias(mockTenantId, mockProjectId);
            expect(result).toHaveLength(1);
            expect(result[0].pendingIssues).toContain('SEM_ENDERECO');
            expect(result[0].pendingIssues).toContain('SEM_INSCRICAO');
        });
        it('should filter out parcels with no issues', async () => {
            const completeParcel = {
                ...mockParcel,
                workflowStatus: 'APROVADA',
                pendingIssues: [],
            };
            jest.spyOn(repository, 'list').mockResolvedValue([completeParcel]);
            const result = await service.listPendencias(mockTenantId, mockProjectId);
            expect(result).toHaveLength(0);
        });
    });
    describe('findById', () => {
        it('should return a parcel by id', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(mockParcel);
            const result = await service.findById(mockTenantId, mockProjectId, 'parcel-001');
            expect(result).toEqual(expect.objectContaining({
                ...mockParcel,
                id: expect.any(String),
            }));
            expect(repository.findById).toHaveBeenCalledWith(mockTenantId, mockProjectId, 'parcel-001');
        });
        it('should return null for non-existent parcel', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);
            const result = await service.findById(mockTenantId, mockProjectId, 'invalid-id');
            expect(result).toBeNull();
        });
    });
    describe('getHistory', () => {
        it('should return audit trail for parcel', async () => {
            const auditLog = [
                {
                    id: 'audit-001',
                    parcelId: 'parcel-001',
                    action: 'CREATE',
                    userId: mockUserId,
                    timestamp: new Date('2026-01-01'),
                    diff: {},
                },
                {
                    id: 'audit-002',
                    parcelId: 'parcel-001',
                    action: 'UPDATE',
                    userId: mockUserId,
                    timestamp: new Date('2026-01-15'),
                    diff: { status: { before: 'ATIVO', after: 'INATIVO' } },
                },
            ];
            jest.spyOn(auditRepository, 'listByParcel').mockResolvedValue(auditLog);
            const result = await service.getHistory(mockTenantId, mockProjectId, 'parcel-001');
            expect(result).toEqual(auditLog);
            expect(result).toHaveLength(2);
            expect(result[0].action).toBe('CREATE');
            expect(result[1].action).toBe('UPDATE');
        });
        it('should return empty array if no history', async () => {
            jest.spyOn(auditRepository, 'listByParcel').mockResolvedValue([]);
            const result = await service.getHistory(mockTenantId, mockProjectId, 'parcel-001');
            expect(result).toEqual([]);
        });
    });
    describe('getAuditLog', () => {
        it('should aggregate tenant-scoped audit entries and total count', async () => {
            const entries = [
                { id: 'audit-001', action: 'UPDATE', parcelId: 'parcel-001' },
                { id: 'audit-002', action: 'CREATE', parcelId: 'parcel-001' },
            ];
            jest.spyOn(auditRepository, 'listAll').mockResolvedValue(entries);
            jest.spyOn(auditRepository, 'countAll').mockResolvedValue(2);
            const result = await service.getAuditLog(mockTenantId, {
                parcelId: 'parcel-001',
                action: 'UPDATE',
                limit: 10,
                offset: 5,
            });
            expect(result.total).toBe(2);
            expect(result.entries).toEqual(entries);
            expect(result.limit).toBe(10);
            expect(result.offset).toBe(5);
            expect(auditRepository.listAll).toHaveBeenCalledWith(mockTenantId, {
                parcelId: 'parcel-001',
                action: 'UPDATE',
                limit: 10,
                offset: 5,
            });
            expect(auditRepository.countAll).toHaveBeenCalledWith(mockTenantId, {
                parcelId: 'parcel-001',
                action: 'UPDATE',
                limit: 10,
                offset: 5,
            });
        });
    });
    describe('create', () => {
        it('should create parcel with valid geometry', async () => {
            const createDto = {
                inscription: '0001.001.0001-01',
                mainAddress: 'Rua A, 123',
                geometry: validPolygon,
                areaTerreno: 250.5,
                status: 'ATIVO',
            };
            jest.spyOn(repository, 'create').mockResolvedValue({
                ...mockParcel,
                id: '507f1f77bcf86cd799439012',
            });
            const result = await service.create(mockTenantId, createDto, mockUserId);
            expect(result).toEqual(expect.objectContaining({
                ...mockParcel,
                id: expect.any(String),
            }));
            expect(repository.create).toHaveBeenCalled();
        });
        it('should reject invalid geometry', async () => {
            const createDto = {
                inscription: '0001.001.0001-01',
                mainAddress: 'Rua A, 123',
                geometry: invalidGeometry,
                areaTerreno: 250.5,
                status: 'ATIVO',
            };
            await expect(service.create(mockTenantId, createDto, mockUserId)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should reject parcel without inscription', async () => {
            const createDto = {
                mainAddress: 'Rua A, 123',
                geometry: validPolygon,
                areaTerreno: 250.5,
                status: 'ATIVO',
            };
            await expect(service.create(mockTenantId, createDto, mockUserId)).rejects.toThrow();
        });
        it('should accept either inscription or inscricaoImobiliaria', async () => {
            const createDto = {
                inscricaoImobiliaria: '0001.001.0001-01',
                mainAddress: 'Rua A, 123',
                geometry: validPolygon,
                areaTerreno: 250.5,
                status: 'ATIVO',
            };
            jest.spyOn(repository, 'create').mockResolvedValue({
                ...mockParcel,
                id: '507f1f77bcf86cd799439013',
            });
            const result = await service.create(mockTenantId, createDto, mockUserId);
            expect(result).toEqual(expect.objectContaining({
                ...mockParcel,
                id: expect.any(String),
            }));
        });
    });
    describe('Geometry validation', () => {
        it('should validate polygon geometry correctly', async () => {
            const validPolygons = [
                {
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
                {
                    type: 'MultiPolygon',
                    coordinates: [
                        [
                            [
                                [-46.305, -23.55],
                                [-46.304, -23.55],
                                [-46.304, -23.551],
                                [-46.305, -23.551],
                                [-46.305, -23.55],
                            ],
                        ],
                    ],
                },
            ];
            for (const geometry of validPolygons) {
                jest.spyOn(repository, 'create').mockResolvedValue(mockParcel);
                const createDto = {
                    inscription: '0001.001.0001-01',
                    mainAddress: 'Rua A, 123',
                    geometry,
                    status: 'ATIVO',
                };
                jest.spyOn(repository, 'create').mockResolvedValue({
                    ...mockParcel,
                    id: '507f1f77bcf86cd799439014',
                });
                const result = await service.create(mockTenantId, createDto, mockUserId);
                expect(result).toBeDefined();
            }
        });
        it('should reject LineString geometry for parcel', async () => {
            const lineGeometry = {
                type: 'LineString',
                coordinates: [
                    [-46.305, -23.55],
                    [-46.304, -23.55],
                ],
            };
            await expect(service.create(mockTenantId, {
                inscription: '0001.001.0001-01',
                geometry: lineGeometry,
            })).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('getSummary', () => {
        it('should link parcel to related cadastral and inspection data', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue({
                ...mockParcel,
                logradouroId: new mongoose_1.Types.ObjectId(),
            });
            parcelBuildingsServiceMock.findByParcel.mockResolvedValue([{ id: 'building-1' }]);
            parcelInfrastructureServiceMock.findByParcel.mockResolvedValue([{ id: 'infra-1' }]);
            parcelSocioeconomicServiceMock.findByParcel.mockResolvedValue([{ id: 'socio-1' }]);
            logradourosServiceMock.findById.mockResolvedValue({ id: 'logradouro-1', nome: 'Rua A' });
            const result = await service.getSummary(mockTenantId, mockProjectId, 'parcel-001');
            expect(result.parcel.id).toBe('parcel-001');
            expect(result.building).toHaveLength(1);
            expect(result.infrastructure).toHaveLength(1);
            expect(result.socioeconomic).toHaveLength(1);
            expect(result.logradouro).toMatchObject({ id: 'logradouro-1', nome: 'Rua A' });
        });
    });
    describe('Status normalization', () => {
        it('should normalize valid status values', async () => {
            const validStatuses = ['ATIVO', 'INATIVO', 'CONFLITO'];
            for (const status of validStatuses) {
                jest.spyOn(repository, 'create').mockResolvedValue({
                    ...mockParcel,
                    status,
                    id: '507f1f77bcf86cd799439015',
                });
                const result = await service.create(mockTenantId, {
                    inscription: '0001.001.0001-01',
                    mainAddress: 'Rua A, 123',
                    geometry: validPolygon,
                    status,
                }, mockUserId);
                expect(result.status).toBe(status);
            }
        });
        it('should default to ATIVO for invalid status', async () => {
            jest.spyOn(repository, 'create').mockResolvedValue({
                ...mockParcel,
                status: 'ATIVO',
                id: '507f1f77bcf86cd799439016',
            });
            const result = await service.create(mockTenantId, {
                inscription: '0001.001.0001-01',
                mainAddress: 'Rua A, 123',
                geometry: validPolygon,
                status: 'INVALID_STATUS',
            });
            expect(result.status).toBe('ATIVO');
        });
    });
    describe('Workflow status', () => {
        it('should support workflow status transitions', async () => {
            const workflowStatuses = [
                'PENDENTE',
                'EM_VALIDACAO',
                'APROVADA',
                'REPROVADA',
            ];
            for (const status of workflowStatuses) {
                jest.spyOn(repository, 'create').mockResolvedValue({
                    ...mockParcel,
                    workflowStatus: status,
                    id: '507f1f77bcf86cd799439017',
                });
                const result = await service.create(mockTenantId, {
                    inscription: '0001.001.0001-01',
                    mainAddress: 'Rua A, 123',
                    geometry: validPolygon,
                    workflowStatus: status,
                }, mockUserId);
                expect(result.workflowStatus).toBe(status);
            }
        });
    });
});
//# sourceMappingURL=ctm-parcels.spec.js.map