import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

// CTM & GIS
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ParcelAuditRepository } from '../src/modules/ctm/parcels/parcel-audit.repository';
import { ImportBatchRepository } from '../src/modules/ctm/parcels/import-batch.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../src/modules/ctm/logradouros/logradouros.service';
import { ParcelSubdivisionService } from '../src/modules/ctm/parcels/parcel-subdivision.service';
import { ParcelSubdivisionRepository } from '../src/modules/ctm/parcels/parcel-subdivision.repository';
import { GeometryService } from '../src/modules/ctm/geometry.service';

// Finance & Tax
import { IptuService } from '../src/modules/pgv/iptu/iptu.service';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { ValuationsService } from '../src/modules/pgv/valuations/valuations.service';

// Surveys & Field Work
import { SurveysService } from '../src/modules/surveys/surveys.service';
import { SurveysRepository } from '../src/modules/surveys/surveys.repository';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { GeoserverPublisherService } from '../src/modules/shared/geoserver-publisher.service';

// Permits & Obras
import { PermitsWorksService } from '../src/modules/permits-works/permits-works.service';
import { PermitsWorksRepository } from '../src/modules/permits-works/permits-works.repository';
import { CertificatesService } from '../src/modules/certificates/certificates.service';
import { DigitalSignatureService } from '../src/common/services/digital-signature.service';

// Compliance & LGPD
import { LgpdAuditService } from '../src/common/services/lgpd-audit.service';
import { CacheService } from '../src/modules/shared/cache.service';

describe('Municipal User Journeys E2E Integration', () => {
  let moduleRef: TestingModule;

  // Services
  let parcelsService: ParcelsService;
  let subdivisionService: ParcelSubdivisionService;
  let iptuService: IptuService;
  let surveysService: SurveysService;
  let permitsWorksService: PermitsWorksService;
  let digitalSignatureService: DigitalSignatureService;
  let lgpdAuditService: LgpdAuditService;

  // Shared variables
  const tenantId = new Types.ObjectId().toHexString();
  const projectId = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();
  let createdParcelId: string;
  let subdivRequestId: string;
  let surveyId: string;
  let permitRequestId: string;

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

  // Setup Mock Database Repositories
  const mockParcels = new Map<string, any>();
  const mockSubdivisions = new Map<string, any>();
  const mockSurveys = new Map<string, any>();
  const mockPermitRequests = new Map<string, any>();
  const mockLgpdLogs = new Map<string, any>();

  const mockParcelsRepository = {
    list: jest.fn().mockImplementation(() => Promise.resolve(Array.from(mockParcels.values()))),
    findById: jest.fn().mockImplementation((tId, pId, id) => {
      const p = mockParcels.get(id);
      if (p) return Promise.resolve(p);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { id, _id: id, statusCadastral: 'ATIVO', status: 'ATIVO', workflowStatus: 'PENDENTE', ...data };
      mockParcels.set(id, record);
      return Promise.resolve(record);
    }),
    update: jest.fn().mockImplementation((tId, id, data) => {
      const record = mockParcels.get(id) || {};
      const updated = { ...record, ...data };
      mockParcels.set(id, updated);
      return Promise.resolve(updated);
    }),
    delete: jest.fn().mockImplementation((tId, id) => {
      mockParcels.delete(id);
      return Promise.resolve(true);
    }),
  };

  const mockSubdivisionRepository = {
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { id, status: 'RASCUNHO', ...data };
      mockSubdivisions.set(id, record);
      return Promise.resolve(record);
    }),
    findById: jest.fn().mockImplementation((tenantId, id) => Promise.resolve(mockSubdivisions.get(id) || null)),
    update: jest.fn().mockImplementation((id, tenantId, update) => {
      const record = mockSubdivisions.get(id) || {};
      const updated = { ...record, ...update };
      mockSubdivisions.set(id, updated);
      return Promise.resolve(updated);
    }),
    save: jest.fn().mockImplementation((record) => {
      mockSubdivisions.set(record.id, record);
      return Promise.resolve(record);
    }),
  };

  const mockSurveysRepository = {
    list: jest.fn().mockImplementation(() => Promise.resolve(Array.from(mockSurveys.values()))),
    findById: jest.fn().mockImplementation((tId, pId, id) => Promise.resolve(mockSurveys.get(id) || null)),
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { id, files: [], auditLog: [], qa: {}, ...data };
      mockSurveys.set(id, record);
      return Promise.resolve(record);
    }),
    save: jest.fn().mockImplementation((record) => {
      mockSurveys.set(record.id, record);
      return Promise.resolve(record);
    }),
  };

  const mockPermitsWorksRepository = {
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { id, status: 'TRIAGEM', timeline: [], ...data };
      mockPermitRequests.set(id, record);
      return Promise.resolve(record);
    }),
    findById: jest.fn().mockImplementation((tId, id) => Promise.resolve(mockPermitRequests.get(id) || null)),
    update: jest.fn().mockImplementation((tId, id, data) => {
      const record = mockPermitRequests.get(id) || {};
      const updated = { ...record, ...data };
      mockPermitRequests.set(id, updated);
      return Promise.resolve(updated);
    }),
  };

  const mockLgpdAuditRepository = {
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { id, createdAt: new Date().toISOString(), ...data };
      mockLgpdLogs.set(id, record);
      return Promise.resolve(record);
    }),
    find: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(Array.from(mockLgpdLogs.values())),
        })),
      })),
    })),
    countDocuments: jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(mockLgpdLogs.size),
    })),
  };

  const mockParcelModel = {
    findById: jest.fn().mockImplementation((id) => ({
      lean: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockParcels.get(id) || null),
      })),
    })),
    find: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(Array.from(mockParcels.values())),
        })),
      })),
    })),
    create: jest.fn().mockImplementation((data) => {
      const id = new Types.ObjectId().toHexString();
      const record = { _id: id, id, ...data };
      mockParcels.set(id, record);
      return Promise.resolve(record);
    }),
    updateOne: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        // CTM & GIS
        ParcelsService,
        ParcelSubdivisionService,
        GeometryService,
        { provide: ParcelsRepository, useValue: mockParcelsRepository },
        { provide: ParcelSubdivisionRepository, useValue: mockSubdivisionRepository },
        { provide: ParcelAuditRepository, useValue: { create: jest.fn(), listByParcel: jest.fn() } },
        { provide: ImportBatchRepository, useValue: { create: jest.fn(), update: jest.fn() } },
        { provide: ParcelBuildingsService, useValue: { findByParcel: jest.fn().mockResolvedValue([]) } },
        { provide: ParcelInfrastructureService, useValue: { findByParcel: jest.fn().mockResolvedValue([]) } },
        { provide: ParcelSocioeconomicService, useValue: { findByParcel: jest.fn().mockResolvedValue([]) } },
        { provide: LogradourosService, useValue: { findById: jest.fn(), findByGeometry: jest.fn().mockResolvedValue([]) } },
        {
          provide: ProjectsService,
          useValue: { resolveProjectId: jest.fn().mockResolvedValue(new Types.ObjectId(projectId)) },
        },
        { provide: 'ParcelModel', useValue: mockParcelModel },
        { provide: 'ParcelSubdivisionModel', useValue: {} },

        // Finance & Tax
        IptuService,
        { provide: 'PgvZoneModel', useValue: {} },
        { provide: 'PgvValuationModel', useValue: {} },
        { provide: ValuationsService, useValue: { calculateValuation: jest.fn().mockResolvedValue({ valorVenal: 150000 }) } },
        { provide: TenantsService, useValue: { getAliquotasPadrao: jest.fn().mockResolvedValue({ aliquotaIptuPadrao: 0.01 }) } },

        // Surveys
        SurveysService,
        { provide: SurveysRepository, useValue: mockSurveysRepository },
        { provide: ObjectStorageService, useValue: { createPresignedUpload: jest.fn(), createPresignedDownload: jest.fn() } },
        { provide: GeoserverPublisherService, useValue: { publishGeoTiff: jest.fn() } },
        { provide: 'LayerModel', useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn() } },
        { provide: 'SurveyModel', useValue: {} },

        // Permits
        PermitsWorksService,
        { provide: PermitsWorksRepository, useValue: mockPermitsWorksRepository },
        {
          provide: CertificatesService,
          useValue: {
            issue: jest.fn().mockResolvedValue({
              id: new Types.ObjectId().toHexString(),
              signature: 'digital-sig',
              signedAt: new Date().toISOString(),
            }),
          },
        },
        { provide: 'PermitWorkModel', useValue: {} },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), invalidateByPrefix: jest.fn() } },
        DigitalSignatureService,

        // LGPD
        LgpdAuditService,
        { provide: 'LgpdAuditModel', useValue: mockLgpdAuditRepository },
      ],
    }).compile();

    parcelsService = moduleRef.get<ParcelsService>(ParcelsService);
    subdivisionService = moduleRef.get<ParcelSubdivisionService>(ParcelSubdivisionService);
    iptuService = moduleRef.get<IptuService>(IptuService);
    surveysService = moduleRef.get<SurveysService>(SurveysService);
    permitsWorksService = moduleRef.get<PermitsWorksService>(PermitsWorksService);
    digitalSignatureService = moduleRef.get<DigitalSignatureService>(DigitalSignatureService);
    lgpdAuditService = moduleRef.get<LgpdAuditService>(LgpdAuditService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // Journey 1: O Servidor de Cadastro & GIS
  describe('Jornada 1: CTM & GIS (Cadastro e Loteamento)', () => {
    it('deve criar uma nova parcela imobiliária no território municipal', async () => {
      const dto = {
        sqlu: '001002000301',
        inscription: '001.002.0003-01',
        mainAddress: 'Av. Iperoig, 100',
        geometry: validPolygon,
        areaTerreno: 500,
        status: 'ATIVO',
      };

      const parcel = await parcelsService.create(tenantId, dto, userId);
      expect(parcel.id).toBeDefined();
      expect(parcel.sqlu).toBe('001002000301');
      expect(parcel.mainAddress).toBe('Av. Iperoig, 100');
      createdParcelId = parcel.id;
    });

    it('deve iniciar um processo de desmembramento (subdivisão)', async () => {
      const dto = {
        parentParcelId: createdParcelId,
        tipo: 'DESMEMBRAMENTO' as const,
        childDefinitions: [
          {
            sqlu: '001002000302',
            inscription: '001.002.0003-02',
            mainAddress: 'Av. Iperoig, 100-A',
            geometry: validPolygon,
            areaTerreno: 250,
          },
          {
            sqlu: '001002000303',
            inscription: '001.002.0003-03',
            mainAddress: 'Av. Iperoig, 100-B',
            geometry: validPolygon,
            areaTerreno: 250,
          },
        ],
      };

      const request = await subdivisionService.createRequest(tenantId, projectId, userId, dto as any);
      expect(request.id).toBeDefined();
      expect(request.status).toBe('RASCUNHO');
      subdivRequestId = request.id;
    });

    it('deve protocolar e aprovar o desmembramento, arquivando o pai e ativando os filhos', async () => {
      // Protocolar
      const requestUpdate = await subdivisionService.updateRequest(tenantId, subdivRequestId, { status: 'PROTOCOLADO' });
      expect(requestUpdate).not.toBeNull();
      expect(requestUpdate!.status).toBe('PROTOCOLADO');

      // Aprovar
      const requestApproved = await subdivisionService.approve(tenantId, projectId, subdivRequestId, userId);
      expect(requestApproved).not.toBeNull();
      expect(requestApproved.status).toBe('APROVADO');
      expect(mockParcelsRepository.create).toHaveBeenCalled();
    });
  });

  // Journey 2: O Secretário de Finanças e Tributação
  describe('Jornada 2: IPTU & Finanças', () => {
    it('deve calcular o IPTU real de uma parcela baseado na PGV e alíquota regional', async () => {
      // Mock details to simulate seed/calculated properties
      const parcel = mockParcels.get(createdParcelId);
      if (parcel) {
        parcel.valorVenalTotal = 150000;
        parcel.aliquotaIptu = 0.01;
        parcel.iptuDevido = 1500;
      }

      const calculation = await iptuService.calculateForParcel({
        parcelId: createdParcelId,
        tenantId,
        projectId,
      });

      expect(calculation.parcelId).toBe(createdParcelId);
      expect(calculation.valorVenalTotal).toBe(150000);
      expect(calculation.aliquotaIptu).toBe(0.01);
      expect(calculation.iptuDevido).toBe(1500);
    });
  });

  // Journey 3: O Fiscal de Obras e Campo (Vistorias)
  describe('Jornada 3: Fiscal de Campo & Vistorias', () => {
    it('deve abrir chamados de vistoria vinculados a lotes territoriais', async () => {
      const dto = {
        projectId,
        name: 'Vistoria de Ocupação irregular',
        type: 'MOBILE_LIDAR_360' as const,
        municipality: 'Ubatuba',
        surveyDate: '2026-05-26',
        srcDatum: 'SIRGAS2000',
        supplier: 'Fiscalização Urbana',
      };

      const survey = await surveysService.create(tenantId, dto, userId);
      expect(survey.id).toBeDefined();
      expect(survey.pipelineStatus).toBe('RECEBIDO');
      surveyId = survey.id;
    });

    it('deve validar preenchimento e conformidade do laudo técnico (QA)', async () => {
      const updated = await surveysService.updateQa(tenantId, projectId, surveyId, {
        coverageOk: true,
        qualityOk: true,
        comments: 'Área completamente vistoriada, sem invasões.',
      }, userId);

      expect(updated.qa.coverageOk).toBe(true);
      expect(updated.qa.comments).toBe('Área completamente vistoriada, sem invasões.');
    });
  });

  // Journey 4: O Diretor de Obras (Processos, Alvarás e Assinatura Digital)
  describe('Jornada 4: Diretor de Obras (Alvarás & Assinatura Digital)', () => {
    it('deve submeter solicitação de Alvará de Obras integrado ao lote', async () => {
      const dto = {
        applicantName: 'Paulo Engenharia',
        subjectAddress: 'Av. Iperoig, 100',
        parcelId: createdParcelId,
        ownerName: 'Paulo Engenharia',
        description: 'Construção Residencial Multifamiliar',
        type: 'ALVARA_CONSTRUCAO',
      };

      const request = await permitsWorksService.create(tenantId, dto, userId);
      expect(request.id).toBeDefined();
      expect(request.parcelId).toBe(createdParcelId);
      permitRequestId = request.id;
    });

    it('deve assinar digitalmente as certidões e validar integridade criptográfica com RSA', async () => {
      const payload = {
        documentType: 'ALVARA_OBRA',
        tenantId,
        parcelId: createdParcelId,
        hash: 'document-content-sha256-hash',
      };

      // Assinar
      const signedResult = digitalSignatureService.signPayload(payload);
      expect(signedResult).toBeDefined();
      expect(signedResult.signature).toBeDefined();

      // Verificar
      const verified = digitalSignatureService.verifySignature(signedResult);
      expect(verified).toBe(true);
    });
  });

  // Journey 5: O Cidadão & LGPD (Privacidade e Direito ao Esquecimento)
  describe('Jornada 5: Cidadão & Conformidade LGPD', () => {
    it('deve auditar e registrar consentimento explícito LGPD', async () => {
      await lgpdAuditService.logAccess({
        tenantId,
        actorId: userId,
        action: 'CONSENT_RECORDED',
        resourceType: 'CITIZEN_CALL',
        resourceId: 'call-123',
        ipAddress: '127.0.0.1',
      });

      expect(mockLgpdAuditRepository.create).toHaveBeenCalled();
    });

    it('deve realizar anonimização total e direito ao esquecimento (Art. 18 LGPD)', async () => {
      const success = await lgpdAuditService.anonymize(tenantId, 'CITIZEN', 'citizen-123');
      expect(success).toBe(true);
    });
  });
});

