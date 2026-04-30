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
exports.ParcelSubdivisionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_schema_1 = require("./parcel.schema");
const parcel_subdivision_repository_1 = require("./parcel-subdivision.repository");
const parcels_repository_1 = require("./parcels.repository");
const geometry_service_1 = require("../geometry.service");
const object_id_1 = require("../../../common/utils/object-id");
let ParcelSubdivisionService = class ParcelSubdivisionService {
    constructor(parcelModel, repository, parcelsRepository, geometryService) {
        this.parcelModel = parcelModel;
        this.repository = repository;
        this.parcelsRepository = parcelsRepository;
        this.geometryService = geometryService;
    }
    async createRequest(tenantId, projectId, userId, dto) {
        const parent = await this.parcelsRepository.findById(tenantId, projectId, dto.parentParcelId);
        if (!parent) {
            throw new common_1.NotFoundException('Parcela origem nao encontrada');
        }
        if (parent.statusCadastral !== 'ATIVO' && parent.statusCadastral !== 'CONFLITO') {
            throw new common_1.BadRequestException('Parcela origem deve estar ATIVO ou CONFLITO');
        }
        if (dto.childDefinitions.length < 2) {
            throw new common_1.BadRequestException('Desmembramento requer pelo menos 2 parcelas filhas');
        }
        for (const child of dto.childDefinitions) {
            if (!this.geometryService.isValidGeometry(child.geometry)) {
                throw new common_1.BadRequestException(`Geometria invalida para parcela ${child.sqlu}`);
            }
        }
        this.geometryService.validateNoOverlap(dto.childDefinitions.map((c) => c.geometry));
        const childrenWithArea = dto.childDefinitions.map((child) => ({
            ...child,
            area: this.geometryService.calculateArea(child.geometry),
            areaPercent: 0,
        }));
        const totalChildArea = childrenWithArea.reduce((sum, c) => sum + c.area, 0);
        const parentArea = parent.areaTerreno || parent.area || 1;
        childrenWithArea.forEach((c) => {
            c.areaPercent = Math.round((c.area / totalChildArea) * 10000) / 100;
        });
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            parentParcelId: (0, object_id_1.asObjectId)(dto.parentParcelId),
            tipo: dto.tipo || 'DESMEMBRAMENTO',
            status: 'RASCUNHO',
            numeroProcesso: dto.numeroProcesso,
            motivo: dto.motivo,
            observacoes: dto.observacoes,
            requerente: dto.requerente,
            childDefinitions: childrenWithArea,
            createdBy: (0, object_id_1.asObjectId)(userId),
        });
    }
    async listRequests(tenantId, projectId, filters) {
        return this.repository.list(tenantId, projectId, filters);
    }
    async getRequest(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async updateRequest(tenantId, id, dto) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        if (request.status === 'APROVADO' || request.status === 'REJEITADO' || request.status === 'CANCELADO') {
            throw new common_1.BadRequestException('Solicitacao ja finalizada');
        }
        const update = {};
        if (dto.motivo !== undefined)
            update.motivo = dto.motivo;
        if (dto.observacoes !== undefined)
            update.observacoes = dto.observacoes;
        if (dto.requerente !== undefined)
            update.requerente = dto.requerente;
        if (dto.status) {
            const validTransitions = {
                RASCUNHO: ['PROTOCOLADO', 'CANCELADO'],
                PROTOCOLADO: ['EM_ANALISE', 'CANCELADO'],
                EM_ANALISE: ['APROVADO', 'REJEITADO', 'CANCELADO'],
            };
            const allowed = validTransitions[request.status] || [];
            if (!allowed.includes(dto.status)) {
                throw new common_1.BadRequestException(`Transicao invalida: ${request.status} -> ${dto.status}`);
            }
            update.status = dto.status;
        }
        return (await this.repository.update(id, tenantId, update));
    }
    async approve(tenantId, projectId, requestId, userId) {
        const request = await this.repository.findById(tenantId, requestId);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        const allowedStatuses = ['PROTOCOLADO', 'EM_ANALISE'];
        if (!allowedStatuses.includes(request.status)) {
            throw new common_1.BadRequestException(`Solicitacao em status ${request.status} nao pode ser aprovada`);
        }
        const parent = await this.parcelsRepository.findById(tenantId, projectId, String(request.parentParcelId));
        if (!parent)
            throw new common_1.NotFoundException('Parcela origem nao encontrada');
        const childIds = [];
        for (const childDef of request.childDefinitions) {
            const child = await this.parcelModel.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: (0, object_id_1.asObjectId)(projectId),
                sqlu: childDef.sqlu,
                geometry: childDef.geometry,
                areaTerreno: childDef.area,
                area: childDef.area,
                mainAddress: childDef.mainAddress || parent.mainAddress,
                inscricaoImobiliaria: childDef.inscricaoImobiliaria,
                setor: parent.setor,
                quadra: parent.quadra,
                zoneamento: parent.zoneamento,
                sourceType: 'MANUAL',
                statusCadastral: 'ATIVO',
                workflowStatus: 'PENDENTE',
                originType: 'SUBDIVIDED',
                parentParcelId: (0, object_id_1.asObjectId)(request.parentParcelId),
                subdivisionRequestId: (0, object_id_1.asObjectId)(requestId),
                subdivisionDate: new Date(),
                createdBy: (0, object_id_1.asObjectId)(userId),
                logradouroId: parent.logradouroId,
                zoneId: parent.zoneId,
            });
            childIds.push(child._id);
        }
        await this.parcelModel.updateOne({ _id: request.parentParcelId }, {
            $set: {
                statusCadastral: 'INATIVO',
                originType: 'ORIGINAL',
                observacoes: `Desmembrado em ${childIds.length} lotes (solicitacao ${requestId})`,
                updatedBy: (0, object_id_1.asObjectId)(userId),
            },
        });
        for (const childId of childIds) {
            const childParcel = await this.parcelModel.findById(childId);
            if (childParcel?.geometry) {
                const centroid = this.geometryService.calculateCentroid(childParcel.geometry);
                const bbox = this.geometryService.calculateBbox(childParcel.geometry);
                await this.parcelModel.updateOne({ _id: childId }, { $set: { centroid, bbox } });
            }
        }
        return (await this.repository.update(requestId, tenantId, {
            status: 'APROVADO',
            childParcelIds: childIds,
            aprovadoPor: (0, object_id_1.asObjectId)(userId),
            aprovadoEm: new Date(),
        }));
    }
    async reject(tenantId, requestId, userId, motivoRejeicao) {
        const request = await this.repository.findById(tenantId, requestId);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        const allowedStatuses = ['PROTOCOLADO', 'EM_ANALISE'];
        if (!allowedStatuses.includes(request.status)) {
            throw new common_1.BadRequestException(`Solicitacao em status ${request.status} nao pode ser rejeitada`);
        }
        return (await this.repository.update(requestId, tenantId, {
            status: 'REJEITADO',
            motivoRejeicao,
            rejeitadoPor: (0, object_id_1.asObjectId)(userId),
            rejeitadoEm: new Date(),
        }));
    }
    async cancel(tenantId, requestId) {
        const request = await this.repository.findById(tenantId, requestId);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        const cancellable = ['RASCUNHO', 'PROTOCOLADO', 'EM_ANALISE'];
        if (!cancellable.includes(request.status)) {
            throw new common_1.BadRequestException(`Solicitacao em status ${request.status} nao pode ser cancelada`);
        }
        return (await this.repository.update(requestId, tenantId, { status: 'CANCELADO' }));
    }
    async getChildren(tenantId, parentParcelId) {
        return this.parcelModel
            .find({ tenantId, parentParcelId: (0, object_id_1.asObjectId)(parentParcelId) })
            .lean()
            .exec();
    }
    async getParentChain(tenantId, parcelId) {
        const chain = [];
        let current = await this.parcelModel.findById(parcelId).lean().exec();
        const visited = new Set();
        while (current && current.parentParcelId && !visited.has(String(current._id))) {
            visited.add(String(current._id));
            const parent = await this.parcelModel
                .findById(current.parentParcelId)
                .lean()
                .exec();
            if (parent) {
                chain.push(parent);
                current = parent;
            }
            else {
                break;
            }
        }
        return chain;
    }
};
exports.ParcelSubdivisionService = ParcelSubdivisionService;
exports.ParcelSubdivisionService = ParcelSubdivisionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_schema_1.Parcel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        parcel_subdivision_repository_1.ParcelSubdivisionRepository,
        parcels_repository_1.ParcelsRepository,
        geometry_service_1.GeometryService])
], ParcelSubdivisionService);
//# sourceMappingURL=parcel-subdivision.service.js.map