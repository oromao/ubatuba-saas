import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { Layer, LayerDocument } from '../layers/layer.schema';
import { ProjectsService } from '../projects/projects.service';
import { GeoserverPublisherService } from '../shared/geoserver-publisher.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import {
  CompleteSurveyUploadDto,
  CreateSurveyDto,
  RequestSurveyUploadDto,
  UpdateSurveyDto,
  UpdateSurveyQaDto,
} from './dto/surveys.dto';
import { SurveyDocument } from './survey.schema';
import { SurveysRepository } from './surveys.repository';

@Injectable()
export class SurveysService {
  constructor(
    private readonly repository: SurveysRepository,
    private readonly projectsService: ProjectsService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly geoserverPublisher: GeoserverPublisherService,
    @InjectModel(Layer.name) private readonly layerModel: Model<LayerDocument>,
  ) {}

  private sanitizeName(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48);
  }

  private appendAudit(
    survey: SurveyDocument,
    params: { actorId?: string; action: string; details?: Record<string, unknown> },
  ) {
    survey.auditLog.push({
      id: randomUUID(),
      actorId: params.actorId,
      action: params.action,
      timestamp: new Date().toISOString(),
      details: params.details,
    });
  }

  private async resolveProject(tenantId: string, projectId?: string) {
    return this.projectsService.resolveProjectId(tenantId, projectId);
  }

  private ensureCreateConstraints(dto: CreateSurveyDto) {
    if (dto.type === 'AEROFOTO_RGB_5CM' && dto.gsdCm === undefined) {
      throw new BadRequestException('Para aerofoto RGB 5cm, o campo gsdCm e obrigatorio.');
    }
  }

  async list(tenantId: string, projectId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProject));
  }

  async findById(tenantId: string, projectId: string | undefined, surveyId: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const survey = await this.repository.findById(tenantId, String(resolvedProject), surveyId);
    if (!survey) throw new BadRequestException('Levantamento nao encontrado');
    return survey;
  }

  async create(tenantId: string, dto: CreateSurveyDto, actorId?: string) {
    this.ensureCreateConstraints(dto);
    const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      name: dto.name,
      type: dto.type,
      pipelineStatus: 'RECEBIDO',
      metadata: {
        municipality: dto.municipality,
        surveyDate: dto.surveyDate,
        gsdCm: dto.gsdCm,
        srcDatum: dto.srcDatum,
        precision: dto.precision,
        supplier: dto.supplier,
        technicalResponsibleId: dto.technicalResponsibleId,
        observations: dto.observations,
        bbox: dto.bbox,
        areaGeometry: dto.areaGeometry,
      },
      files: [],
      qa: {},
      publication: undefined,
      auditLog: [
        {
          id: randomUUID(),
          actorId,
          action: 'CREATE_SURVEY',
          timestamp: new Date().toISOString(),
          details: { type: dto.type, municipality: dto.municipality },
        },
      ],
      createdBy: actorId ? asObjectId(actorId) : undefined,
    });
  }

  async update(
    tenantId: string,
    projectId: string | undefined,
    surveyId: string,
    dto: UpdateSurveyDto,
    actorId?: string,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const survey = await this.repository.findById(tenantId, String(resolvedProject), surveyId);
    if (!survey) throw new BadRequestException('Levantamento nao encontrado');

    if (dto.name !== undefined) survey.name = dto.name;
    if (dto.pipelineStatus !== undefined) survey.pipelineStatus = dto.pipelineStatus;
    survey.metadata = {
      ...survey.metadata,
      municipality: dto.municipality ?? survey.metadata.municipality,
      surveyDate: dto.surveyDate ?? survey.metadata.surveyDate,
      gsdCm: dto.gsdCm ?? survey.metadata.gsdCm,
      srcDatum: dto.srcDatum ?? survey.metadata.srcDatum,
      precision: dto.precision ?? survey.metadata.precision,
      supplier: dto.supplier ?? survey.metadata.supplier,
      technicalResponsibleId: dto.technicalResponsibleId ?? survey.metadata.technicalResponsibleId,
      observations: dto.observations ?? survey.metadata.observations,
    };
    survey.updatedBy = actorId ? asObjectId(actorId) : survey.updatedBy;
    this.appendAudit(survey, {
      actorId,
      action: 'UPDATE_SURVEY',
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(survey);
  }

  async requestUpload(
    tenantId: string,
    projectId: string | undefined,
    surveyId: string,
    dto: RequestSurveyUploadDto,
  ) {
    const survey = await this.findById(tenantId, projectId, surveyId);
    const key = `tenants/${tenantId}/surveys/${surveyId}/${Date.now()}-${this.sanitizeName(dto.fileName)}`;
    const presigned = await this.objectStorageService.createPresignedUpload({
      key,
      contentType: dto.mimeType ?? 'application/octet-stream',
    });
    return {
      ...presigned,
      file: {
        surveyId: survey.id,
        category: dto.category,
        fileName: dto.fileName,
        size: dto.size,
      },
    };
  }

  async completeUpload(
    tenantId: string,
    projectId: string | undefined,
    surveyId: string,
    dto: CompleteSurveyUploadDto,
    actorId?: string,
  ) {
    const survey = await this.findById(tenantId, projectId, surveyId);
    survey.files.push({
      id: randomUUID(),
      name: dto.name,
      category: dto.category,
      key: dto.key,
      mimeType: dto.mimeType,
      size: dto.size,
      uploadedAt: new Date().toISOString(),
    });
    survey.pipelineStatus = 'VALIDANDO';
    this.appendAudit(survey, {
      actorId,
      action: 'COMPLETE_UPLOAD',
      details: { key: dto.key, category: dto.category },
    });
    return this.repository.save(survey);
  }

  async listFiles(tenantId: string, projectId: string | undefined, surveyId: string) {
    const survey = await this.findById(tenantId, projectId, surveyId);
    return survey.files;
  }

  async getFileDownload(
    tenantId: string,
    projectId: string | undefined,
    surveyId: string,
    fileId: string,
  ) {
    const survey = await this.findById(tenantId, projectId, surveyId);
    const file = survey.files.find((item) => item.id === fileId);
    if (!file) throw new BadRequestException('Arquivo nao encontrado');
    return this.objectStorageService.createPresignedDownload({ key: file.key });
  }

  async updateQa(
    tenantId: string,
    projectId: string | undefined,
    surveyId: string,
    dto: UpdateSurveyQaDto,
    actorId?: string,
  ) {
    const survey = await this.findById(tenantId, projectId, surveyId);
    survey.qa = {
      ...survey.qa,
      coverageOk: dto.coverageOk ?? survey.qa.coverageOk,
      georeferencingOk: dto.georeferencingOk ?? survey.qa.georeferencingOk,
      qualityOk: dto.qualityOk ?? survey.qa.qualityOk,
      comments: dto.comments ?? survey.qa.comments,
      checkedBy: actorId ?? survey.qa.checkedBy,
      checkedAt: new Date().toISOString(),
    };
    this.appendAudit(survey, {
      actorId,
      action: 'UPDATE_QA',
      details: { coverageOk: survey.qa.coverageOk, georeferencingOk: survey.qa.georeferencingOk },
    });
    return this.repository.save(survey);
  }

  async publish(tenantId: string, projectId: string | undefined, surveyId: string, actorId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const survey = await this.findById(tenantId, String(resolvedProject), surveyId);

    const rasterFile =
      survey.files.find((file) => file.name.toLowerCase().endsWith('.tif')) ??
      survey.files.find((file) => file.name.toLowerCase().endsWith('.tiff')) ??
      survey.files.find((file) => file.category.toUpperCase().includes('COG'));
    if (!rasterFile) {
      throw new BadRequestException('Nao ha arquivo GeoTIFF/COG para publicar.');
    }

    const file = await this.objectStorageService.getObjectBuffer(rasterFile.key);
    const workspace = `tenant_${this.sanitizeName(tenantId).slice(0, 16)}`;
    const suffix = this.sanitizeName(survey.name || surveyId) || surveyId.slice(0, 8);
    const store = `survey_${suffix}`;
    const layerName = `survey_${suffix}`;

    await this.geoserverPublisher.publishGeoTiff({
      workspace,
      store,
      layerName,
      fileBuffer: file.buffer,
    });

    const existingLayer = await this.layerModel
      .findOne({
        tenantId: asObjectId(tenantId),
        source: 'geoserver',
        'geoserver.workspace': workspace,
        'geoserver.layerName': layerName,
      })
      .exec();

    if (!existingLayer) {
      const topLayer = await this.layerModel
        .find({ tenantId: asObjectId(tenantId) })
        .sort({ order: -1 })
        .limit(1)
        .exec();
      const order = (topLayer[0]?.order ?? 20) + 1;
      await this.layerModel.create({
        tenantId: asObjectId(tenantId),
        name: `${survey.name} (${survey.type})`,
        group: 'Levantamentos',
        type: 'raster',
        source: 'geoserver',
        geoserver: { workspace, layerName },
        opacity: 1,
        visible: false,
        order,
      });
    }

    survey.publication = {
      workspace,
      layerName,
      store,
      publishedAt: new Date().toISOString(),
    };
    survey.pipelineStatus = 'PUBLICADO';
    survey.updatedBy = actorId ? asObjectId(actorId) : survey.updatedBy;
    this.appendAudit(survey, {
      actorId,
      action: 'PUBLISH_GEOSERVER',
      details: { workspace, layerName, sourceKey: rasterFile.key },
    });
    return this.repository.save(survey);
  }
}

