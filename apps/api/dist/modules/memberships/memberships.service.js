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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipsService = void 0;
const common_1 = require("@nestjs/common");
const memberships_repository_1 = require("./memberships.repository");
const object_id_1 = require("../../common/utils/object-id");
let MembershipsService = class MembershipsService {
    constructor(membershipsRepository) {
        this.membershipsRepository = membershipsRepository;
    }
    findByUserAndTenant(userId, tenantId) {
        return this.membershipsRepository.findByUserAndTenant(userId, tenantId);
    }
    create(data) {
        return this.membershipsRepository.create({
            tenantId: (0, object_id_1.asObjectId)(data.tenantId),
            userId: (0, object_id_1.asObjectId)(data.userId),
            role: data.role,
        });
    }
};
exports.MembershipsService = MembershipsService;
exports.MembershipsService = MembershipsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [memberships_repository_1.MembershipsRepository])
], MembershipsService);
//# sourceMappingURL=memberships.service.js.map