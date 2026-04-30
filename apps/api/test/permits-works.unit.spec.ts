import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PermitsWorksService } from '../src/modules/permits-works/permits-works.service';
import { PermitsWorksRepository } from '../src/modules/permits-works/permits-works.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { CertificatesService } from '../src/modules/certificates/certificates.service';
import { CacheService } from '../src/modules/shared/cache.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { PermitWorkRequestDocument } from '../src/modules/permits-works/permit-work.schema';

const TID = '507f1f77bcf86cd799439011';
const PID = '507f1f77bcf86cd799439012';

function makePermit(overrides: Partial<PermitWorkRequestDocument> = {}): Partial<PermitWorkRequestDocument> {
  return {
    _id: '507f1f77bcf86cd799439001' as any,
    tenantId: TID as any,
    projectId: PID as any,
    protocolNumber: 'OB-20260430-ABC123',
    applicantName: 'JOAO DA SILVA',
    subjectAddress: 'Rua A, 100',
    status: 'ABERTO',
    currentStage: 'ABERTURA',
    history: [],
    requirements: [],
    evidences: [],
    invoices: [],
    save: jest.fn().mockResolvedValue({}),
    ...overrides,
  } as any;
}

const mockRepository = {
  list: jest.fn().mockResolvedValue([]),
  findById: jest.fn(),
  create: jest.fn(),
  save: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockProjectsService = {
  resolveProjectId: jest.fn().mockResolvedValue(PID),
};

const mockCertificatesService = {
  issue: jest.fn().mockResolvedValue({}),
};

const mockStorage = {
  putObject: jest.fn().mockResolvedValue({}),
};

const mockCache = {
  invalidateByPrefix: jest.fn(),
};

describe('PermitsWorksService - Unit Tests (T8-PROCESS-ALVARA)', () => {
  let service: PermitsWorksService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        PermitsWorksService,
        { provide: PermitsWorksRepository, useValue: mockRepository },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: CertificatesService, useValue: mockCertificatesService },
        { provide: ObjectStorageService, useValue: mockStorage },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = moduleRef.get<PermitsWorksService>(PermitsWorksService);
  });

  afterAll(async () => {
    if (typeof (moduleRef as any).close === 'function') {
      await (moduleRef as any).close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectsService.resolveProjectId.mockResolvedValue(PID);
  });

  // ==========================================================================
  // CREATE
  // ==========================================================================

  describe('create', () => {
    it('should create a permit work request with protocol', async () => {
      mockRepository.create.mockImplementation((data) => Promise.resolve(data));

      const result = await service.create(TID, {
        applicantName: 'Joao',
        subjectAddress: 'Rua X',
        requirements: ['ART', 'Projeto Arquitetonico'],
        parcelId: '507f1f77bcf86cd799439099',
      });

      expect(result).toBeDefined();
      expect(result.protocolNumber).toMatch(/^OB-/);
      expect(result.status).toBe('ABERTO');
      expect(result.currentStage).toBe('ABERTURA');
      expect(result.requirements).toHaveLength(2);
      expect(result.parcelId).toBe('507f1f77bcf86cd799439099');
    });

    it('should create a permit without parcelId (optional)', async () => {
      mockRepository.create.mockImplementation((data) => Promise.resolve(data));
      const result = await service.create(TID, {
        applicantName: 'Joao',
        subjectAddress: 'Rua X',
      });
      expect(result).toBeDefined();
    });
  });

  // ==========================================================================
  // WORKFLOW TRANSITIONS
  // ==========================================================================

  describe('update (stage transitions)', () => {
    it('should transition ABERTURA → ANALISE_TECNICA', async () => {
      const permit = makePermit({ currentStage: 'ABERTURA', status: 'ABERTO' });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.update(TID, 'id', { stage: 'ANALISE_TECNICA', message: 'Iniciando analise' } as any);

      expect(result.currentStage).toBe('ANALISE_TECNICA');
      expect(result.status).toBe('EM_ANALISE');
    });

    it('should reject invalid transitions', async () => {
      const permit = makePermit({ currentStage: 'ABERTURA', status: 'ABERTO' });
      mockRepository.findById.mockResolvedValue(permit);

      await expect(
        service.update(TID, 'id', { stage: 'ASSINATURA', message: 'skip!' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition to EXIGENCIAS and auto-create requirement', async () => {
      const permit = makePermit({ currentStage: 'ANALISE_TECNICA', requirements: [] });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.update(TID, 'id', { stage: 'EXIGENCIAS', message: 'Doc faltando' } as any);

      expect(result.currentStage).toBe('EXIGENCIAS');
      expect(result.status).toBe('EXIGENCIA');
      expect(result.requirements.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // DECIDE (Approve / Reject / Return)
  // ==========================================================================

  describe('decide', () => {
    it('should approve (DEFERIDO) with auto-certificate and validUntil', async () => {
      const permit = makePermit({ currentStage: 'PARECER', status: 'EM_ANALISE' });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.decide(TID, 'id', 'DEFERIDO', 'Tudo OK', 'user-1');

      expect(result.status).toBe('CONCLUIDO');
      expect(result.decision?.kind).toBe('DEFERIDO');
      expect(result.validUntil).toBeDefined();
      expect(result.validUntil!.getTime()).toBeGreaterThan(Date.now());

      // Certificate auto-generation called
      expect(mockCertificatesService.issue).toHaveBeenCalledWith(
        TID,
        expect.objectContaining({
          type: 'ALVARA_OBRAS',
          subjectName: 'JOAO DA SILVA',
          subjectDocument: 'OB-20260430-ABC123',
        }),
        'user-1',
      );
    });

    it('should reject (INDEFERIDO) without certificate', async () => {
      const permit = makePermit({ currentStage: 'ANALISE_TECNICA', status: 'EM_ANALISE' });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.decide(TID, 'id', 'INDEFERIDO', 'Documentacao irregular');

      expect(result.status).toBe('INDEFERIDO');
      expect(result.decision?.kind).toBe('INDEFERIDO');
      expect(mockCertificatesService.issue).not.toHaveBeenCalled();
    });

    it('should return (DEVOLVIDO) to EXIGENCIAS', async () => {
      const permit = makePermit({ currentStage: 'PARECER', status: 'EM_ANALISE' });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.decide(TID, 'id', 'DEVOLVIDO', 'Docs incompletos');

      expect(result.status).toBe('EXIGENCIA');
      expect(result.currentStage).toBe('EXIGENCIAS');
    });

    it('should still approve even if certificate generation fails', async () => {
      mockCertificatesService.issue.mockRejectedValueOnce(new Error('DB down'));
      const permit = makePermit({ currentStage: 'PARECER', status: 'EM_ANALISE' });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.decide(TID, 'id', 'DEFERIDO', 'OK');

      // Approval succeeds despite certificate error
      expect(result.status).toBe('CONCLUIDO');
      expect(result.decision?.kind).toBe('DEFERIDO');
    });
  });

  // ==========================================================================
  // EVIDENCES & REQUIREMENTS
  // ==========================================================================

  describe('addEvidence', () => {
    it('should add evidence with history entry', async () => {
      const permit = makePermit();
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.addEvidence(TID, 'id', 'Foto do local', 'fachada', 'foto.jpg', 'user-1');

      expect(result.evidences.length).toBe(1);
      expect(result.evidences[0].title).toBe('Foto do local');
      expect(result.history.length).toBe(1);
    });
  });

  describe('addRequirementResponse', () => {
    it('should mark requirement as ATENDIDA and add evidence', async () => {
      const permit = makePermit({
        requirements: [{
          id: 'req-1', title: 'ART', status: 'ABERTA',
          createdAt: new Date().toISOString(),
        }],
      });
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.addRequirementResponse(TID, 'id', 'req-1', 'ART anexada', 'user-1');

      expect(result.requirements[0].status).toBe('ATENDIDA');
      expect(result.evidences.length).toBe(1);
    });

    it('should throw for non-existent requirement', async () => {
      mockRepository.findById.mockResolvedValue(makePermit());
      await expect(
        service.addRequirementResponse(TID, 'id', 'nonexistent', 'test'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================================
  // PDF ISSUE
  // ==========================================================================

  describe('issueDecisionPdf', () => {
    it('should generate PDF and store', async () => {
      const permit = makePermit();
      mockRepository.findById.mockResolvedValue(permit);

      const result = await service.issueDecisionPdf(TID, 'id');

      expect(result.currentStage).toBe('EMISSAO');
      expect(result.status).toBe('EMISSO');
      expect(result.decisionPdfKey).toContain('permits-works');
      expect(mockStorage.putObject).toHaveBeenCalled();
    });
  });
});
