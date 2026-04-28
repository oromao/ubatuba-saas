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
exports.ValuationsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const valuation_schema_1 = require("./valuation.schema");
const object_id_1 = require("../../../common/utils/object-id");
let ValuationsRepository = class ValuationsRepository {
    constructor(model) {
        this.model = model;
    }
    list(tenantId, projectId) {
        return this.model
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    findByParcel(tenantId, projectId, parcelId) {
        return this.model
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId), parcelId: (0, object_id_1.asObjectId)(parcelId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    findLatestByParcel(tenantId, projectId, parcelId) {
        return this.model
            .findOne({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId), parcelId: (0, object_id_1.asObjectId)(parcelId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    listByVersion(tenantId, projectId, versionId) {
        return this.model
            .find({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            versionId: (0, object_id_1.asObjectId)(versionId),
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    create(data) {
        return this.model.create(data);
    }
};
exports.ValuationsRepository = ValuationsRepository;
exports.ValuationsRepository = ValuationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(valuation_schema_1.PgvValuation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ValuationsRepository);
//# sourceMappingURL=valuations.repository.js.map