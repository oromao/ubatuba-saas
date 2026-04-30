import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ParcelSubdivisionService } from '../src/modules/ctm/parcels/parcel-subdivision.service';
import { ParcelSubdivisionRepository } from '../src/modules/ctm/parcels/parcel-subdivision.repository';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { GeometryService } from '../src/modules/ctm/geometry.service';
import { Parcel } from '../src/modules/ctm/parcels/parcel.schema';

const TID = '507f1f77bcf86cd799439011';
const PID = '507f1f77bcf86cd799439012';
const UID = '507f1f77bcf86cd799439013';
const REQID = '507f1f77bcf86cd799439014';

const mockGeometry = {
  type: 'Polygon',
  coordinates: [[
    [-47.5, -23.55], [-47.5, -23.54],
    [-47.49, -23.54], [-47.49, -23.55],
    [-47.5, -23.55],
  ]],
};

const childGeom1 = {
  type: 'Polygon',
  coordinates: [[
    [-47.5, -23.55], [-47.5, -23.545],
    [-47.495, -23.545], [-47.495, -23.55],
    [-47.5, -23.55],
  ]],
};

const childGeom2 = {
  type: 'Polygon',
  coordinates: [[
    [-47.495, -23.545], [-47.495, -23.54],
    [-47.49, -23.54], [-47.49, -23.545],
    [-47.495, -23.545],
  ]],
};

const mockParent = {
  id: '507f1f77bcf86cd799439001',
  _id: '507f1f77bcf86cd799439001',
  sqlu: 'PARENT-001',
  areaTerreno: 1000,
  statusCadastral: 'ATIVO',
  workflowStatus: 'APROVADA',
  geometry: mockGeometry,
  mainAddress: 'Rua A, 100',
  setor: 'S1',
  quadra: 'Q1',
  zoneamento: 'ZR1',
  logradouroId: '507f1f77bcf86cd799439099',
  zoneId: '507f1f77bcf86cd799439088',
};

const mockRequest = {
  _id: REQID,
  tenantId: TID,
  projectId: PID,
  parentParcelId: '507f1f77bcf86cd799439001',
  tipo: 'DESMEMBRAMENTO',
  status: 'RASCUNHO',
  childDefinitions: [
    { sqlu: 'CHILD-001', geometry: childGeom1, area: 500, areaPercent: 50 },
    { sqlu: 'CHILD-002', geometry: childGeom2, area: 500, areaPercent: 50 },
  ],
};

const mockParcelsRepository = {
  findById: jest.fn().mockResolvedValue(mockParent),
};

const mockGeometryService = {
  isValidGeometry: jest.fn().mockReturnValue(true),
  validateNoOverlap: jest.fn(),
  calculateArea: jest.fn().mockReturnValue(500),
  calculateCentroid: jest.fn().mockReturnValue({ type: 'Point', coordinates: [-47.495, -23.545] }),
  calculateBbox: jest.fn().mockReturnValue({ minX: -47.5, minY: -23.55, maxX: -47.49, maxY: -23.54 }),
};

const mockSubdivisionRepo = {
  create: jest.fn().mockImplementation((data) => Promise.resolve({ ...mockRequest, ...data })),
  findById: jest.fn().mockResolvedValue(mockRequest),
  list: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockImplementation((id, tid, data) => Promise.resolve({ ...mockRequest, ...data })),
};

const mockParcelModel = {
  create: jest.fn().mockImplementation((d) => Promise.resolve({ _id: 'child-id-new', ...d })),
  findById: jest.fn().mockResolvedValue(null),
  find: jest.fn(),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
};

describe('ParcelSubdivisionService - Unit Tests (T8-CTM-COMPLETO)', () => {
  let service: ParcelSubdivisionService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        ParcelSubdivisionService,
        { provide: ParcelSubdivisionRepository, useValue: mockSubdivisionRepo },
        { provide: ParcelsRepository, useValue: mockParcelsRepository },
        { provide: GeometryService, useValue: mockGeometryService },
        { provide: getModelToken(Parcel.name), useValue: mockParcelModel },
      ],
    }).compile();

    service = moduleRef.get<ParcelSubdivisionService>(ParcelSubdivisionService);
  });

  afterAll(async () => {
    // TestingModule v10+ close() signature
    if (typeof (moduleRef as any).close === 'function') {
      await (moduleRef as any).close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockParcelsRepository.findById.mockResolvedValue(mockParent);
    mockGeometryService.isValidGeometry.mockReturnValue(true);
    mockGeometryService.calculateArea.mockReturnValue(500);
  });

  describe('createRequest', () => {
    it('should create a subdivision request', async () => {
      const result = await service.createRequest(TID, PID, UID, {
        parentParcelId: '507f1f77bcf86cd799439001',
        tipo: 'DESMEMBRAMENTO',
        motivo: 'Teste',
        childDefinitions: [
          { sqlu: 'C1', geometry: childGeom1 },
          { sqlu: 'C2', geometry: childGeom2 },
        ],
      });

      expect(result).toBeDefined();
      expect(result.tipo).toBe('DESMEMBRAMENTO');
      expect(result.status).toBe('RASCUNHO');
      expect(result.childDefinitions).toHaveLength(2);
      expect(mockSubdivisionRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should reject if parent not found', async () => {
      mockParcelsRepository.findById.mockResolvedValue(null);
      await expect(
        service.createRequest(TID, PID, UID, {
          parentParcelId: 'nonexistent',
          childDefinitions: [{ sqlu: 'C1', geometry: childGeom1 }],
        }),
      ).rejects.toThrow('nao encontrada');
    });

    it('should reject if parent is INATIVO', async () => {
      mockParcelsRepository.findById.mockResolvedValue({ ...mockParent, statusCadastral: 'INATIVO' });
      await expect(
        service.createRequest(TID, PID, UID, {
          parentParcelId: '507f1f77bcf86cd799439001',
          childDefinitions: [{ sqlu: 'C1', geometry: childGeom1 }, { sqlu: 'C2', geometry: childGeom2 }],
        }),
      ).rejects.toThrow('ATIVO ou CONFLITO');
    });

    it('should reject if less than 2 children', async () => {
      await expect(
        service.createRequest(TID, PID, UID, {
          parentParcelId: '507f1f77bcf86cd799439001',
          childDefinitions: [{ sqlu: 'C1', geometry: childGeom1 }],
        }),
      ).rejects.toThrow('2 parcelas filhas');
    });

    it('should reject invalid geometry', async () => {
      mockGeometryService.isValidGeometry.mockReturnValue(false);
      await expect(
        service.createRequest(TID, PID, UID, {
          parentParcelId: '507f1f77bcf86cd799439001',
          childDefinitions: [
            { sqlu: 'C1', geometry: childGeom1 },
            { sqlu: 'C2', geometry: { type: 'Invalid' } },
          ],
        }),
      ).rejects.toThrow('Geometria invalida');
    });
  });

  describe('listRequests and getRequest', () => {
    it('should list requests with filters', async () => {
      mockSubdivisionRepo.list.mockResolvedValue([mockRequest as any]);
      const result = await service.listRequests(TID, PID, { status: 'RASCUNHO' });
      expect(result).toHaveLength(1);
    });

    it('should get a single request', async () => {
      mockSubdivisionRepo.findById.mockResolvedValue(mockRequest as any);
      const result = await service.getRequest(TID, REQID);
      expect(result).toBeDefined();
    });
  });

  describe('approve', () => {
    it('should approve and create child parcels', async () => {
      mockSubdivisionRepo.findById.mockResolvedValue({
        ...mockRequest,
        status: 'EM_ANALISE',
        save: jest.fn(),
      } as any);

      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockParent, geometry: mockGeometry }),
      } as any);

      const result = await service.approve(TID, PID, REQID, UID);

      expect(result).toBeDefined();
      if (result) expect(result.status).toBe('APROVADO');
      expect(mockParcelModel.create).toHaveBeenCalledTimes(2);
      expect(mockParcelModel.updateOne).toHaveBeenCalledTimes(1);
    });

    it('should reject approval of non-approvable status', async () => {
      mockSubdivisionRepo.findById.mockResolvedValue({
        ...mockRequest,
        status: 'RASCUNHO',
        save: jest.fn(),
      } as any);

      await expect(
        service.approve(TID, PID, REQID, UID),
      ).rejects.toThrow('nao pode ser aprovada');
    });
  });

  describe('reject and cancel', () => {
    it('should reject a request', async () => {
      mockSubdivisionRepo.findById.mockResolvedValue({
        ...mockRequest,
        status: 'EM_ANALISE',
        save: jest.fn(),
      } as any);

      const result = await service.reject(TID, REQID, UID, 'Area nao confere');
      expect(result).toBeDefined();
      if (result) expect(result.status).toBe('REJEITADO');
    });

    it('should cancel a request', async () => {
      mockSubdivisionRepo.findById.mockResolvedValue({
        ...mockRequest,
        status: 'PROTOCOLADO',
        save: jest.fn(),
      } as any);

      const result = await service.cancel(TID, REQID);
      expect(result).toBeDefined();
      if (result) expect(result.status).toBe('CANCELADO');
    });
  });
});
