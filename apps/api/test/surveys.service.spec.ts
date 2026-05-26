import { SurveysService } from '../src/modules/surveys/surveys.service';
import { SurveysRepository } from '../src/modules/surveys/surveys.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { GeoserverPublisherService } from '../src/modules/shared/geoserver-publisher.service';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

let mockSurvey: any;

const mockRepository = {
  list: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockImplementation((tenantId, projectId, id) => {
    if (mockSurvey && mockSurvey.id === id) {
      return Promise.resolve(mockSurvey);
    }
    return Promise.resolve(null);
  }),
  create: jest.fn().mockImplementation((data) => {
    mockSurvey = {
      id: new Types.ObjectId().toString(),
      files: [],
      auditLog: [],
      qa: {},
      ...data,
    };
    return Promise.resolve(mockSurvey);
  }),
  save: jest.fn().mockImplementation((survey) => {
    mockSurvey = survey;
    return Promise.resolve(survey);
  }),
} as unknown as SurveysRepository;

const mockProjectsService = {
  resolveProjectId: jest.fn().mockImplementation((tenantId, projectId) => {
    return Promise.resolve(projectId ? new Types.ObjectId(projectId) : new Types.ObjectId());
  }),
} as unknown as ProjectsService;

const mockObjectStorage = {
  createPresignedUpload: jest.fn().mockResolvedValue({ url: 'upload-url', key: 'file-key' }),
  createPresignedDownload: jest.fn().mockResolvedValue({ url: 'download-url' }),
  getObjectBuffer: jest.fn().mockResolvedValue({ buffer: Buffer.from('test') }),
} as unknown as ObjectStorageService;

const mockGeoserverPublisher = {
  publishGeoTiff: jest.fn().mockResolvedValue(undefined),
} as unknown as GeoserverPublisherService;

const mockLayerModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  }),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
  }),
  create: jest.fn().mockResolvedValue({}),
} as any;

describe('SurveysService', () => {
  let service: SurveysService;
  let actorId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSurvey = null;
    actorId = new Types.ObjectId().toString();
    service = new SurveysService(
      mockRepository,
      mockProjectsService,
      mockObjectStorage,
      mockGeoserverPublisher,
      mockLayerModel,
    );
  });

  it('should list surveys', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();

    await service.list(tenantId, projectId);

    expect(mockProjectsService.resolveProjectId).toHaveBeenCalledWith(tenantId, projectId);
    expect(mockRepository.list).toHaveBeenCalled();
  });

  it('should create survey with proper constraints', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento 2026',
      type: 'AEROFOTO_RGB_5CM' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      gsdCm: 5,
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };

    const created = await service.create(tenantId, dto, actorId);

    expect(created.name).toBe('Levantamento 2026');
    expect(created.pipelineStatus).toBe('RECEBIDO');
    expect(created.auditLog[0].action).toBe('CREATE_SURVEY');
  });

  it('should throw error when creating survey of type AEROFOTO_RGB_5CM without gsdCm', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento Invalido',
      type: 'AEROFOTO_RGB_5CM' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };

    await expect(service.create(tenantId, dto, actorId)).rejects.toThrow(BadRequestException);
  });

  it('should request upload presigned url', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento 2026',
      type: 'MOBILE_LIDAR_360' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };
    const survey = await service.create(tenantId, dto, actorId);

    const result = await service.requestUpload(tenantId, projectId, survey.id, {
      fileName: 'ortofoto.tif',
      category: 'ORTHOPHOTO',
      size: 1024,
    });

    expect(result.url).toBe('upload-url');
    expect(result.file.fileName).toBe('ortofoto.tif');
  });

  it('should complete upload', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento 2026',
      type: 'MOBILE_LIDAR_360' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };
    const survey = await service.create(tenantId, dto, actorId);

    const updated = await service.completeUpload(tenantId, projectId, survey.id, {
      name: 'ortofoto.tif',
      category: 'ORTHOPHOTO',
      key: 'key-1',
      mimeType: 'image/tiff',
      size: 1024,
    }, actorId);

    expect(updated.files).toHaveLength(1);
    expect(updated.pipelineStatus).toBe('VALIDANDO');
  });

  it('should update QA checklist', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento 2026',
      type: 'MOBILE_LIDAR_360' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };
    const survey = await service.create(tenantId, dto, actorId);

    const updated = await service.updateQa(tenantId, projectId, survey.id, {
      coverageOk: true,
      qualityOk: true,
      comments: 'Quality checked and approved',
    }, actorId);

    expect(updated.qa.coverageOk).toBe(true);
    expect(updated.qa.comments).toBe('Quality checked and approved');
  });

  it('should publish GeoTIFF to Geoserver', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      projectId,
      name: 'Levantamento 2026',
      type: 'MOBILE_LIDAR_360' as const,
      municipality: 'Ubatuba',
      surveyDate: '2026-05-01',
      srcDatum: 'SIRGAS2000',
      supplier: 'GeoEmpresa',
    };
    const survey = await service.create(tenantId, dto, actorId);
    await service.completeUpload(tenantId, projectId, survey.id, {
      name: 'ortofoto.tif',
      category: 'ORTHOPHOTO',
      key: 'key-1',
      mimeType: 'image/tiff',
      size: 1024,
    }, actorId);

    const published = await service.publish(tenantId, projectId, survey.id, actorId);

    expect(mockGeoserverPublisher.publishGeoTiff).toHaveBeenCalled();
    expect(published.pipelineStatus).toBe('PUBLICADO');
  });
});
