"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveysService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const layer_schema_1 = require("../layers/layer.schema");
const projects_service_1 = require("../projects/projects.service");
const geoserver_publisher_service_1 = require("../shared/geoserver-publisher.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const surveys_repository_1 = require("./surveys.repository");
let SurveysService = class SurveysService {
    constructor(repository, projectsService, objectStorageService, geoserverPublisher, layerModel) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.objectStorageService = objectStorageService;
        this.geoserverPublisher = geoserverPublisher;
        this.layerModel = layerModel;
    }
    sanitizeName(value) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 48);
    }
    appendAudit(survey, params) {
        survey.auditLog.push({
            id: (0, crypto_1.randomUUID)(),
            actorId: params.actorId,
            action: params.action,
            timestamp: new Date().toISOString(),
            details: params.details,
        });
    }
    async resolveProject(tenantId, projectId) {
        return this.projectsService.resolveProjectId(tenantId, projectId);
    }
    ensureCreateConstraints(dto) {
        if (dto.type === 'AEROFOTO_RGB_5CM' && dto.gsdCm === undefined) {
            throw new common_1.BadRequestException('Para aerofoto RGB 5cm, o campo gsdCm e obrigatorio.');
        }
    }
    async list(tenantId, projectId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProject));
    }
    async findById(tenantId, projectId, surveyId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const survey = await this.repository.findById(tenantId, String(resolvedProject), surveyId);
        if (!survey)
            throw new common_1.BadRequestException('Levantamento nao encontrado');
        return survey;
    }
    async create(tenantId, dto, actorId) {
        this.ensureCreateConstraints(dto);
        const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
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
                    id: (0, crypto_1.randomUUID)(),
                    actorId,
                    action: 'CREATE_SURVEY',
                    timestamp: new Date().toISOString(),
                    details: { type: dto.type, municipality: dto.municipality },
                },
            ],
            createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
    }
    async update(tenantId, projectId, surveyId, dto, actorId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const survey = await this.repository.findById(tenantId, String(resolvedProject), surveyId);
        if (!survey)
            throw new common_1.BadRequestException('Levantamento nao encontrado');
        if (dto.name !== undefined)
            survey.name = dto.name;
        if (dto.pipelineStatus !== undefined)
            survey.pipelineStatus = dto.pipelineStatus;
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
        survey.updatedBy = actorId ? (0, object_id_1.asObjectId)(actorId) : survey.updatedBy;
        this.appendAudit(survey, {
            actorId,
            action: 'UPDATE_SURVEY',
            details: { fields: Object.keys(dto) },
        });
        return this.repository.save(survey);
    }
    async requestUpload(tenantId, projectId, surveyId, dto) {
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
    async completeUpload(tenantId, projectId, surveyId, dto, actorId) {
        const survey = await this.findById(tenantId, projectId, surveyId);
        survey.files.push({
            id: (0, crypto_1.randomUUID)(),
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
    async listFiles(tenantId, projectId, surveyId) {
        const survey = await this.findById(tenantId, projectId, surveyId);
        return survey.files;
    }
    async getFileDownload(tenantId, projectId, surveyId, fileId) {
        const survey = await this.findById(tenantId, projectId, surveyId);
        const file = survey.files.find((item) => item.id === fileId);
        if (!file)
            throw new common_1.BadRequestException('Arquivo nao encontrado');
        return this.objectStorageService.createPresignedDownload({ key: file.key });
    }
    async updateQa(tenantId, projectId, surveyId, dto, actorId) {
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
    async publish(tenantId, projectId, surveyId, actorId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const survey = await this.findById(tenantId, String(resolvedProject), surveyId);
        const rasterFile = survey.files.find((file) => file.name.toLowerCase().endsWith('.tif')) ??
            survey.files.find((file) => file.name.toLowerCase().endsWith('.tiff')) ??
            survey.files.find((file) => file.category.toUpperCase().includes('COG'));
        if (!rasterFile) {
            throw new common_1.BadRequestException('Nao ha arquivo GeoTIFF/COG para publicar.');
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
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            source: 'geoserver',
            'geoserver.workspace': workspace,
            'geoserver.layerName': layerName,
        })
            .exec();
        if (!existingLayer) {
            const topLayer = await this.layerModel
                .find({ tenantId: (0, object_id_1.asObjectId)(tenantId) })
                .sort({ order: -1 })
                .limit(1)
                .exec();
            const order = (topLayer[0]?.order ?? 20) + 1;
            await this.layerModel.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
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
        survey.updatedBy = actorId ? (0, object_id_1.asObjectId)(actorId) : survey.updatedBy;
        this.appendAudit(survey, {
            actorId,
            action: 'PUBLISH_GEOSERVER',
            details: { workspace, layerName, sourceKey: rasterFile.key },
        });
        return this.repository.save(survey);
    }
};
exports.SurveysService = SurveysService;
exports.SurveysService = SurveysService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, mongoose_1.InjectModel)(layer_schema_1.Layer.name)),
    __metadata("design:paramtypes", [surveys_repository_1.SurveysRepository,
        projects_service_1.ProjectsService,
        object_storage_service_1.ObjectStorageService,
        geoserver_publisher_service_1.GeoserverPublisherService,
        mongoose_2.Model])
], SurveysService);
//# sourceMappingURL=surveys.service.js.map