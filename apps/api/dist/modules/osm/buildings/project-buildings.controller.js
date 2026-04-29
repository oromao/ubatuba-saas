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
exports.ProjectBuildingsController = void 0;
const common_1 = require("@nestjs/common");
const buildings_service_1 = require("./buildings.service");
let ProjectBuildingsController = class ProjectBuildingsController {
    constructor(buildingsService) {
        this.buildingsService = buildingsService;
    }
    list(req, projectId, bbox) {
        return this.buildingsService.list(req.tenantId, projectId, bbox);
    }
    geojson(req, projectId, bbox) {
        return this.buildingsService.geojson(req.tenantId, projectId, bbox);
    }
};
exports.ProjectBuildingsController = ProjectBuildingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectBuildingsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectBuildingsController.prototype, "geojson", null);
exports.ProjectBuildingsController = ProjectBuildingsController = __decorate([
    (0, common_1.Controller)('api/projects/:projectId/buildings'),
    __metadata("design:paramtypes", [buildings_service_1.BuildingsService])
], ProjectBuildingsController);
//# sourceMappingURL=project-buildings.controller.js.map