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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const object_id_1 = require("../../common/utils/object-id");
const projects_service_1 = require("../projects/projects.service");
const mobile_repository_1 = require("./mobile.repository");
let MobileService = class MobileService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async sync(tenantId, dto, actorId) {
        const resolvedProject = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        let processed = 0;
        for (const item of dto.items) {
            await this.repository.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: resolvedProject,
                parcelId: (0, object_id_1.asObjectId)(item.parcelId),
                checklist: item.checklist ?? {},
                location: item.location,
                photoBase64: item.photoBase64,
                syncStatus: 'RECEBIDO',
                syncedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            });
            processed += 1;
        }
        return { processed };
    }
    async listRecords(tenantId, projectId) {
        const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProject));
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mobile_repository_1.MobileRepository,
        projects_service_1.ProjectsService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map