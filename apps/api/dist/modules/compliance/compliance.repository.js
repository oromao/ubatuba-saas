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
exports.ComplianceRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const compliance_schema_1 = require("./compliance.schema");
let ComplianceRepository = class ComplianceRepository {
    constructor(model) {
        this.model = model;
    }
    async findOrCreate(tenantId, projectId) {
        const existing = await this.model
            .findOne({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .exec();
        if (existing)
            return existing;
        return this.model.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            company: {},
            technicalResponsibles: [],
            artsRrts: [],
            cats: [],
            team: [],
            checklist: [],
            auditLog: [],
        });
    }
    save(profile) {
        return profile.save();
    }
};
exports.ComplianceRepository = ComplianceRepository;
exports.ComplianceRepository = ComplianceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(compliance_schema_1.ComplianceProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ComplianceRepository);
//# sourceMappingURL=compliance.repository.js.map