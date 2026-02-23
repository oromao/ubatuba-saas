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
exports.ParcelsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/guards/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const parcels_service_1 = require("./parcels.service");
const create_parcel_dto_1 = require("./dto/create-parcel.dto");
const update_parcel_dto_1 = require("./dto/update-parcel.dto");
const upsert_parcel_building_dto_1 = require("../parcel-buildings/dto/upsert-parcel-building.dto");
const upsert_parcel_socioeconomic_dto_1 = require("../parcel-socioeconomic/dto/upsert-parcel-socioeconomic.dto");
const upsert_parcel_infrastructure_dto_1 = require("../parcel-infrastructure/dto/upsert-parcel-infrastructure.dto");
const parcel_buildings_service_1 = require("../parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_service_1 = require("../parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_service_1 = require("../parcel-infrastructure/parcel-infrastructure.service");
let ParcelsController = class ParcelsController {
    constructor(parcelsService, parcelBuildingsService, parcelSocioeconomicService, parcelInfrastructureService) {
        this.parcelsService = parcelsService;
        this.parcelBuildingsService = parcelBuildingsService;
        this.parcelSocioeconomicService = parcelSocioeconomicService;
        this.parcelInfrastructureService = parcelInfrastructureService;
    }
    list(req, projectId, sqlu, inscription, inscricaoImobiliaria, status, workflowStatus, bbox, q) {
        return this.parcelsService.list(req.tenantId, projectId, {
            sqlu,
            inscription,
            inscricaoImobiliaria,
            status,
            workflowStatus,
            bbox,
            q,
        });
    }
    pending(req, projectId) {
        return this.parcelsService.listPendencias(req.tenantId, projectId);
    }
    geojson(req, projectId, sqlu, inscription, inscricaoImobiliaria, status, workflowStatus, bbox, q) {
        return this.parcelsService.geojson(req.tenantId, projectId, {
            sqlu,
            inscription,
            inscricaoImobiliaria,
            status,
            workflowStatus,
            bbox,
            q,
        });
    }
    get(req, id, projectId) {
        return this.parcelsService.findById(req.tenantId, projectId, id);
    }
    summary(req, id, projectId) {
        return this.parcelsService.getSummary(req.tenantId, projectId, id);
    }
    history(req, id, projectId) {
        return this.parcelsService.getHistory(req.tenantId, projectId, id);
    }
    create(req, dto) {
        return this.parcelsService.create(req.tenantId, dto, req.user?.sub);
    }
    update(req, id, projectId, dto) {
        return this.parcelsService.update(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    remove(req, id, projectId) {
        return this.parcelsService.remove(req.tenantId, projectId, id);
    }
    upsertBuilding(req, id, projectId, dto) {
        return this.parcelBuildingsService.upsert(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    upsertSocioeconomic(req, id, projectId, dto) {
        return this.parcelSocioeconomicService.upsert(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    upsertInfrastructure(req, id, projectId, dto) {
        return this.parcelInfrastructureService.upsert(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    importGeojson(req, projectId, featureCollection) {
        return this.parcelsService.importGeojson(req.tenantId, projectId, featureCollection, req.user?.sub);
    }
};
exports.ParcelsController = ParcelsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('sqlu')),
    __param(3, (0, common_1.Query)('inscription')),
    __param(4, (0, common_1.Query)('inscricaoImobiliaria')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('workflowStatus')),
    __param(7, (0, common_1.Query)('bbox')),
    __param(8, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('pendencias'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "pending", null);
__decorate([
    (0, common_1.Get)('geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('sqlu')),
    __param(3, (0, common_1.Query)('inscription')),
    __param(4, (0, common_1.Query)('inscricaoImobiliaria')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('workflowStatus')),
    __param(7, (0, common_1.Query)('bbox')),
    __param(8, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "geojson", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "history", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_parcel_dto_1.CreateParcelDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, update_parcel_dto_1.UpdateParcelDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "update", null);
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
], ParcelsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/building'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, upsert_parcel_building_dto_1.UpsertParcelBuildingDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "upsertBuilding", null);
__decorate([
    (0, common_1.Put)(':id/socioeconomic'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, upsert_parcel_socioeconomic_dto_1.UpsertParcelSocioeconomicDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "upsertSocioeconomic", null);
__decorate([
    (0, common_1.Put)(':id/infrastructure'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, upsert_parcel_infrastructure_dto_1.UpsertParcelInfrastructureDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "upsertInfrastructure", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "importGeojson", null);
exports.ParcelsController = ParcelsController = __decorate([
    (0, common_1.Controller)('ctm/parcels'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService,
        parcel_buildings_service_1.ParcelBuildingsService,
        parcel_socioeconomic_service_1.ParcelSocioeconomicService,
        parcel_infrastructure_service_1.ParcelInfrastructureService])
], ParcelsController);
//# sourceMappingURL=parcels.controller.js.map