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
exports.ParcelInfrastructureRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_infrastructure_schema_1 = require("./parcel-infrastructure.schema");
const object_id_1 = require("../../../common/utils/object-id");
let ParcelInfrastructureRepository = class ParcelInfrastructureRepository {
    constructor(model) {
        this.model = model;
    }
    findByParcel(tenantId, projectId, parcelId) {
        return this.model
            .findOne({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            parcelId: (0, object_id_1.asObjectId)(parcelId),
        })
            .exec();
    }
    upsert(tenantId, projectId, parcelId, data) {
        return this.model
            .findOneAndUpdate({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            parcelId: (0, object_id_1.asObjectId)(parcelId),
        }, data, { new: true, upsert: true })
            .exec();
    }
};
exports.ParcelInfrastructureRepository = ParcelInfrastructureRepository;
exports.ParcelInfrastructureRepository = ParcelInfrastructureRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_infrastructure_schema_1.ParcelInfrastructure.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ParcelInfrastructureRepository);
//# sourceMappingURL=parcel-infrastructure.repository.js.map