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
exports.ReurbRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const reurb_schema_1 = require("./reurb.schema");
let ReurbRepository = class ReurbRepository {
    constructor(tenantConfigModel, familyModel, pendencyModel, deliverableModel, auditModel) {
        this.tenantConfigModel = tenantConfigModel;
        this.familyModel = familyModel;
        this.pendencyModel = pendencyModel;
        this.deliverableModel = deliverableModel;
        this.auditModel = auditModel;
    }
    findTenantConfig(tenantId) {
        return this.tenantConfigModel.findOne({ tenantId: (0, object_id_1.asObjectId)(tenantId) }).exec();
    }
    upsertTenantConfig(tenantId, data) {
        return this.tenantConfigModel
            .findOneAndUpdate({ tenantId: (0, object_id_1.asObjectId)(tenantId) }, data, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        })
            .exec();
    }
    createFamily(data) {
        return this.familyModel.create(data);
    }
    listFamilies(tenantId, projectId, filters) {
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.nucleus)
            query.nucleus = filters.nucleus;
        if (filters?.q) {
            const regex = new RegExp(filters.q, 'i');
            query.$or = [
                { familyCode: regex },
                { responsibleName: regex },
                { cpf: regex },
                { address: regex },
            ];
        }
        return this.familyModel.find(query).sort({ updatedAt: -1 }).exec();
    }
    findFamilyById(tenantId, projectId, familyId) {
        return this.familyModel
            .findOne({
            _id: familyId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    updateFamily(tenantId, projectId, familyId, data) {
        return this.familyModel
            .findOneAndUpdate({
            _id: familyId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        }, data, { new: true })
            .exec();
    }
    createPendency(data) {
        return this.pendencyModel.create(data);
    }
    listPendencies(tenantId, projectId, filters) {
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.nucleus)
            query.nucleus = filters.nucleus;
        if (filters?.familyId)
            query.familyId = (0, object_id_1.asObjectId)(filters.familyId);
        return this.pendencyModel.find(query).sort({ updatedAt: -1 }).exec();
    }
    findPendencyById(tenantId, projectId, pendencyId) {
        return this.pendencyModel
            .findOne({
            _id: pendencyId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    async updatePendencyStatus(tenantId, projectId, pendencyId, params) {
        return this.pendencyModel
            .findOneAndUpdate({
            _id: pendencyId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        }, {
            $set: {
                status: params.status,
                observation: params.observation,
                updatedBy: params.actorId,
            },
            $push: {
                statusHistory: params.statusHistoryEntry,
            },
        }, { new: true })
            .exec();
    }
    async createDeliverable(data) {
        return this.deliverableModel.create(data);
    }
    listDeliverables(tenantId, projectId, kind) {
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        };
        if (kind)
            query.kind = kind;
        return this.deliverableModel.find(query).sort({ createdAt: -1 }).exec();
    }
    findDeliverableById(tenantId, projectId, deliverableId) {
        return this.deliverableModel
            .findOne({
            _id: deliverableId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    async nextDeliverableVersion(tenantId, projectId, kind) {
        const latest = await this.deliverableModel
            .findOne({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            kind,
        })
            .sort({ version: -1 })
            .exec();
        return (latest?.version ?? 0) + 1;
    }
    createAuditLog(data) {
        return this.auditModel.create(data);
    }
};
exports.ReurbRepository = ReurbRepository;
exports.ReurbRepository = ReurbRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reurb_schema_1.TenantConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)(reurb_schema_1.ReurbFamily.name)),
    __param(2, (0, mongoose_1.InjectModel)(reurb_schema_1.ReurbDocumentPendency.name)),
    __param(3, (0, mongoose_1.InjectModel)(reurb_schema_1.ReurbDeliverable.name)),
    __param(4, (0, mongoose_1.InjectModel)(reurb_schema_1.ReurbAuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReurbRepository);
//# sourceMappingURL=reurb.repository.js.map