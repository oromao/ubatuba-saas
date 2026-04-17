jest.mock('../src/common/utils/mvt.util', () => ({
  createVectorTile: jest.fn(() => Buffer.from('mock-tile')),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ParcelAuditRepository } from '../src/modules/ctm/parcels/parcel-audit.repository';
import { ImportBatchRepository } from '../src/modules/ctm/parcels/import-batch.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../src/modules/ctm/logradouros/logradouros.service';
import { Types } from 'mongoose';

describe('CTM Parcels Service', () => {
  let service: ParcelsService;
  let repository: ParcelsRepository;
  let projectsService: ProjectsService;
  let auditRepository: ParcelAuditRepository;

  const mockTenantId = new Types.ObjectId().toHexString();
  const mockProjectId = new Types.ObjectId().toHexString();
  const mockUserId = new Types.ObjectId().toHexString();

  // Sample valid polygon geometry (WGS84 coordinates)
  const validPolygon = {
    type: 'Polygon' as const,
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

  // Invalid geometry (missing coordinates)
  const invalidGeometry = {
    type: 'LineString' as const,
    coordinates: [
      [-46.305, -23.55],
      [-46.304, -23.55],
    ],
  };

  const mockParcel = {
    id: 'parcel-001',
    tenantId: mockTenantId as any,
    projectId: mockProjectId as any,
    sqlu: '123.45.67.890',
    inscription: '0001.001.0001-01',
    inscricaoImobiliaria: '0001.001.0001-01',
    mainAddress: 'Rua A, 123',
    geometry: validPolygon,
    areaTerreno: 250.5,
    status: 'ATIVO',
    statusCadastral: 'ATIVO',
    workflowStatus: 'PENDENTE' as any,
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelsService,
        {
          provide: ParcelsRepository,
          useValue: {
            list: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ParcelAuditRepository,
          useValue: {
            listByParcel: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ImportBatchRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            resolveProjectId: jest.fn().mockResolvedValue(mockProjectId),
          },
        },
        {
          provide: ParcelBuildingsService,
          useValue: { findByParcelId: jest.fn() },
        },
        {
          provide: ParcelInfrastructureService,
          useValue: { findByParcelId: jest.fn() },
        },
        {
          provide: ParcelSocioeconomicService,
          useValue: { findByParcelId: jest.fn() },
        },
        {
          provide: LogradourosService,
          useValue: { findByGeometry: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ParcelsService>(ParcelsService);
    repository = module.get<ParcelsRepository>(ParcelsRepository);
    projectsService = module.get<ProjectsService>(ProjectsService);
    auditRepository = module.get<ParcelAuditRepository>(ParcelAuditRepository);
  });

  describe('list', () => {
    it('should return list of parcels for tenant and project', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue([mockParcel as any]);

      const result = await service.list(mockTenantId, mockProjectId);

      expect(result).toEqual([mockParcel]);
      expect(repository.list).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          projectId: mockProjectId,
        }),
      );
    });

    it('should filter parcels by inscription', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue([mockParcel as any]);

      await service.list(mockTenantId, mockProjectId, {
        inscricaoImobiliaria: '0001.001.0001-01',
      });

      expect(repository.list).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          inscricaoImobiliaria: '0001.001.0001-01',
        }),
      );
    });

    it('should filter parcels by bbox', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue([mockParcel as any]);

      await service.list(mockTenantId, mockProjectId, {
        bbox: '-46.31,-23.56,-46.30,-23.55',
      });

      expect(repository.list).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          bbox: '-46.31,-23.56,-46.30,-23.55',
        }),
      );
    });

    it('should filter parcels by workflow status', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue([mockParcel as any]);

      await service.list(mockTenantId, mockProjectId, {
        workflowStatus: 'PENDENTE',
      });

      expect(repository.list).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          workflowStatus: 'PENDENTE',
        }),
      );
    });
  });

  describe('listPendencias', () => {
    it('should return parcels with pending issues', async () => {
      jest
        .spyOn(repository, 'list')
        .mockResolvedValue([mockParcelWithIssues as any]);

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
        .mockResolvedValue([parcelWithoutPrecomputed as any]);

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
      jest.spyOn(repository, 'list').mockResolvedValue([completeParcel as any]);

      const result = await service.listPendencias(mockTenantId, mockProjectId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a parcel by id', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockParcel as any);

      const result = await service.findById(
        mockTenantId,
        mockProjectId,
        'parcel-001',
      );

      expect(result).toEqual(expect.objectContaining({
        ...mockParcel,
        id: expect.any(String),
      }));
      expect(repository.findById).toHaveBeenCalledWith(
        mockTenantId,
        mockProjectId,
        'parcel-001',
      );
    });

    it('should return null for non-existent parcel', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      const result = await service.findById(
        mockTenantId,
        mockProjectId,
        'invalid-id',
      );

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
      jest.spyOn(auditRepository, 'listByParcel').mockResolvedValue(auditLog as any);

      const result = await service.getHistory(
        mockTenantId,
        mockProjectId,
        'parcel-001',
      );

      expect(result).toEqual(auditLog);
      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('CREATE');
      expect(result[1].action).toBe('UPDATE');
    });

    it('should return empty array if no history', async () => {
      jest.spyOn(auditRepository, 'listByParcel').mockResolvedValue([]);

      const result = await service.getHistory(
        mockTenantId,
        mockProjectId,
        'parcel-001',
      );

      expect(result).toEqual([]);
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
      } as any);

      const result = await service.create(mockTenantId, createDto as any, mockUserId);

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

      await expect(
        service.create(mockTenantId, createDto as any, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject parcel without inscription', async () => {
      const createDto = {
        mainAddress: 'Rua A, 123',
        geometry: validPolygon,
        areaTerreno: 250.5,
        status: 'ATIVO',
      };

      await expect(
        service.create(mockTenantId, createDto as any, mockUserId),
      ).rejects.toThrow();
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
      } as any);

      const result = await service.create(mockTenantId, createDto as any, mockUserId);

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
        jest.spyOn(repository, 'create').mockResolvedValue(mockParcel as any);

        const createDto = {
          inscription: '0001.001.0001-01',
          mainAddress: 'Rua A, 123',
          geometry,
          status: 'ATIVO',
        };

        jest.spyOn(repository, 'create').mockResolvedValue({
          ...mockParcel,
          id: '507f1f77bcf86cd799439014',
        } as any);

        const result = await service.create(mockTenantId, createDto as any, mockUserId);
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

      await expect(
        service.create(mockTenantId, {
          inscription: '0001.001.0001-01',
          geometry: lineGeometry,
        } as any),
      ).rejects.toThrow(BadRequestException);
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
        } as any);

        const result = await service.create(
          mockTenantId,
          {
            inscription: '0001.001.0001-01',
            mainAddress: 'Rua A, 123',
            geometry: validPolygon,
            status,
          } as any,
          mockUserId,
        );

        expect(result.status).toBe(status);
      }
    });

    it('should default to ATIVO for invalid status', async () => {
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockParcel,
        status: 'ATIVO',
        id: '507f1f77bcf86cd799439016',
      } as any);

      const result = await service.create(mockTenantId, {
        inscription: '0001.001.0001-01',
        mainAddress: 'Rua A, 123',
        geometry: validPolygon,
        status: 'INVALID_STATUS',
      } as any);

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
        } as any);

        const result = await service.create(
          mockTenantId,
          {
            inscription: '0001.001.0001-01',
            mainAddress: 'Rua A, 123',
            geometry: validPolygon,
            workflowStatus: status,
          } as any,
          mockUserId,
        );

        expect(result.workflowStatus).toBe(status);
      }
    });
  });
});
