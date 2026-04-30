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
exports.ParcelSubdivisionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const parcel_subdivision_service_1 = require("./parcel-subdivision.service");
const update_subdivision_dto_1 = require("./dto/update-subdivision.dto");
let ParcelSubdivisionController = class ParcelSubdivisionController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.createRequest(dto.tenantId, dto.projectId, dto.userId, dto);
    }
    async list(tenantId, projectId, status, tipo, parentParcelId) {
        return this.service.listRequests(tenantId, projectId, { status, tipo, parentParcelId });
    }
    async get(tenantId, id) {
        return this.service.getRequest(tenantId, id);
    }
    async update(tenantId, id, dto) {
        return this.service.updateRequest(tenantId, id, dto);
    }
    async approve(tenantId, projectId, userId, id) {
        return this.service.approve(tenantId, projectId, id, userId);
    }
    async reject(tenantId, userId, id, body) {
        return this.service.reject(tenantId, id, userId, body.motivoRejeicao);
    }
    async cancel(tenantId, id) {
        return this.service.cancel(tenantId, id);
    }
    async children(tenantId, parcelId) {
        return this.service.getChildren(tenantId, parcelId);
    }
    async parents(tenantId, parcelId) {
        return this.service.getParentChain(tenantId, parcelId);
    }
};
exports.ParcelSubdivisionController = ParcelSubdivisionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar solicitação de desmembramento/loteamento' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Listar solicitações de desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('tipo')),
    __param(4, (0, common_1.Query)('parentParcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar solicitação de desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar solicitação de desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_subdivision_dto_1.UpdateSubdivisionDto]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar e executar desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rejeitar desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('parcels/:parcelId/children'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Listar parcelas filhas de um desmembramento' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "children", null);
__decorate([
    (0, common_1.Get)('parcels/:parcelId/parents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cadeia de parcelas pai' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParcelSubdivisionController.prototype, "parents", null);
exports.ParcelSubdivisionController = ParcelSubdivisionController = __decorate([
    (0, swagger_1.ApiTags)('CTM - Desmembramentos'),
    (0, common_1.Controller)('ctm/subdivisions'),
    __metadata("design:paramtypes", [parcel_subdivision_service_1.ParcelSubdivisionService])
], ParcelSubdivisionController);
//# sourceMappingURL=parcel-subdivision.controller.js.map