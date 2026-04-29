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
exports.VersionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const version_schema_1 = require("./version.schema");
const object_id_1 = require("../../../common/utils/object-id");
let VersionsRepository = class VersionsRepository {
    constructor(model) {
        this.model = model;
    }
    list(tenantId, projectId) {
        return this.model
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ year: -1 })
            .exec();
    }
    findById(tenantId, projectId, id) {
        return this.model
            .findOne({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .exec();
    }
    findActive(tenantId, projectId) {
        return this.model
            .findOne({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId), isActive: true })
            .exec();
    }
    findByNameOrYear(tenantId, projectId, value) {
        const year = Number(value);
        const yearFilter = Number.isNaN(year) ? undefined : year;
        return this.model
            .findOne({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            $or: [
                { name: value },
                ...(yearFilter ? [{ year: yearFilter }] : []),
            ],
        })
            .exec();
    }
    create(data) {
        return this.model.create(data);
    }
    update(tenantId, projectId, id, data) {
        return this.model
            .findOneAndUpdate({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, data, { new: true })
            .exec();
    }
    async setActive(tenantId, projectId, id) {
        await this.model.updateMany({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, { isActive: false });
        return this.update(tenantId, projectId, id, { isActive: true });
    }
};
exports.VersionsRepository = VersionsRepository;
exports.VersionsRepository = VersionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(version_schema_1.PgvVersion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VersionsRepository);
//# sourceMappingURL=versions.repository.js.map