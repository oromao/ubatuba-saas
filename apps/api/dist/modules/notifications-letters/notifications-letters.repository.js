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
exports.NotificationsLettersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const letter_batch_schema_1 = require("./letter-batch.schema");
const letter_template_schema_1 = require("./letter-template.schema");
let NotificationsLettersRepository = class NotificationsLettersRepository {
    constructor(templateModel, batchModel) {
        this.templateModel = templateModel;
        this.batchModel = batchModel;
    }
    listTemplates(tenantId, projectId) {
        return this.templateModel
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ name: 1, version: -1 })
            .exec();
    }
    findTemplateById(tenantId, projectId, templateId) {
        return this.templateModel
            .findOne({
            _id: templateId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    async getNextTemplateVersion(tenantId, projectId, name) {
        const latest = await this.templateModel
            .findOne({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId), name })
            .sort({ version: -1 })
            .exec();
        return (latest?.version ?? 0) + 1;
    }
    createTemplate(data) {
        return this.templateModel.create(data);
    }
    updateTemplate(tenantId, projectId, templateId, data) {
        return this.templateModel
            .findOneAndUpdate({ _id: templateId, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, data, { new: true })
            .exec();
    }
    createBatch(data) {
        return this.batchModel.create(data);
    }
    listBatches(tenantId, projectId) {
        return this.batchModel
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    findBatchById(tenantId, projectId, batchId) {
        return this.batchModel
            .findOne({
            _id: batchId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    saveBatch(batch) {
        return batch.save();
    }
};
exports.NotificationsLettersRepository = NotificationsLettersRepository;
exports.NotificationsLettersRepository = NotificationsLettersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(letter_template_schema_1.LetterTemplate.name)),
    __param(1, (0, mongoose_1.InjectModel)(letter_batch_schema_1.LetterBatch.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotificationsLettersRepository);
//# sourceMappingURL=notifications-letters.repository.js.map