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
exports.UrbanFurnitureController = void 0;
const common_1 = require("@nestjs/common");
const urban_furniture_service_1 = require("./urban-furniture.service");
const create_urban_furniture_dto_1 = require("./dto/create-urban-furniture.dto");
const update_urban_furniture_dto_1 = require("./dto/update-urban-furniture.dto");
const roles_decorator_1 = require("../../../common/guards/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
let UrbanFurnitureController = class UrbanFurnitureController {
    constructor(urbanFurnitureService) {
        this.urbanFurnitureService = urbanFurnitureService;
    }
    list(req, projectId, bbox) {
        return this.urbanFurnitureService.list(req.tenantId, projectId, bbox);
    }
    async geojson(req, projectId, bbox) {
        const items = await this.urbanFurnitureService.list(req.tenantId, projectId, bbox);
        return {
            type: 'FeatureCollection',
            features: items.map((item) => ({
                type: 'Feature',
                id: item.id,
                geometry: item.location,
                properties: {
                    featureType: 'urban_furniture',
                    furnitureId: item.id,
                    type: item.type,
                    tipo: item.tipo ?? item.type,
                    condition: item.condition,
                    estadoConservacao: item.estadoConservacao ?? item.condition,
                    notes: item.notes,
                    observacao: item.observacao ?? item.notes,
                    photoUrl: item.photoUrl,
                    fotoUrl: item.fotoUrl ?? item.photoUrl,
                },
            })),
        };
    }
    get(req, id, projectId) {
        return this.urbanFurnitureService.findById(req.tenantId, projectId, id);
    }
    create(req, projectId, dto) {
        return this.urbanFurnitureService.create(req.tenantId, projectId, dto, req.user?.sub);
    }
    update(req, id, projectId, dto) {
        return this.urbanFurnitureService.update(req.tenantId, projectId, id, dto);
    }
    remove(req, id, projectId) {
        return this.urbanFurnitureService.remove(req.tenantId, projectId, id);
    }
};
exports.UrbanFurnitureController = UrbanFurnitureController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UrbanFurnitureController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UrbanFurnitureController.prototype, "geojson", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UrbanFurnitureController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_urban_furniture_dto_1.CreateUrbanFurnitureDto]),
    __metadata("design:returntype", void 0)
], UrbanFurnitureController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, update_urban_furniture_dto_1.UpdateUrbanFurnitureDto]),
    __metadata("design:returntype", void 0)
], UrbanFurnitureController.prototype, "update", null);
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
], UrbanFurnitureController.prototype, "remove", null);
exports.UrbanFurnitureController = UrbanFurnitureController = __decorate([
    (0, common_1.Controller)('ctm/urban-furniture'),
    __metadata("design:paramtypes", [urban_furniture_service_1.UrbanFurnitureService])
], UrbanFurnitureController);
//# sourceMappingURL=urban-furniture.controller.js.map