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
exports.MapFeaturesController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const map_features_service_1 = require("./map-features.service");
const create_map_feature_dto_1 = require("./dto/create-map-feature.dto");
const update_map_feature_dto_1 = require("./dto/update-map-feature.dto");
let MapFeaturesController = class MapFeaturesController {
    constructor(mapFeaturesService) {
        this.mapFeaturesService = mapFeaturesService;
    }
    create(req, dto) {
        return this.mapFeaturesService.create(req.tenantId, dto, req.user?.sub);
    }
    update(req, id, projectId, dto) {
        return this.mapFeaturesService.update(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    remove(req, id, projectId) {
        return this.mapFeaturesService.remove(req.tenantId, projectId, id);
    }
    geojson(req, projectId, bbox, featureType) {
        return this.mapFeaturesService.geojson(req.tenantId, projectId, featureType, bbox);
    }
};
exports.MapFeaturesController = MapFeaturesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_map_feature_dto_1.CreateMapFeatureDto]),
    __metadata("design:returntype", void 0)
], MapFeaturesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, update_map_feature_dto_1.UpdateMapFeatureDto]),
    __metadata("design:returntype", void 0)
], MapFeaturesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MapFeaturesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MapFeaturesController.prototype, "geojson", null);
exports.MapFeaturesController = MapFeaturesController = __decorate([
    (0, common_1.Controller)('map-features'),
    __metadata("design:paramtypes", [map_features_service_1.MapFeaturesService])
], MapFeaturesController);
//# sourceMappingURL=map-features.controller.js.map