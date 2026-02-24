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
exports.TaxIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const tax_integration_dto_1 = require("./dto/tax-integration.dto");
const tax_integration_service_1 = require("./tax-integration.service");
let TaxIntegrationController = class TaxIntegrationController {
    constructor(service) {
        this.service = service;
    }
    echoIntegration() {
        return {
            data: [
                {
                    inscricao: '123',
                    contribuinte: 'JOAO DA SILVA',
                    endereco: 'RUA A, 100',
                    valor_venal: 120000,
                },
            ],
        };
    }
    echoIntegrationPost(body) {
        return { data: body };
    }
    listConnectors(req, projectId) {
        return this.service.listConnectors(req.tenantId, projectId);
    }
    createConnector(req, dto) {
        return this.service.createConnector(req.tenantId, dto, req.user?.sub);
    }
    updateConnector(req, projectId, id, dto) {
        return this.service.updateConnector(req.tenantId, projectId, id, dto);
    }
    testConnection(req, projectId, id) {
        return this.service.testConnection(req.tenantId, projectId, id, req.user?.sub);
    }
    runSync(req, projectId, id, dto) {
        return this.service.runSync(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    listLogs(req, projectId, id) {
        return this.service.listLogs(req.tenantId, projectId, id);
    }
};
exports.TaxIntegrationController = TaxIntegrationController;
__decorate([
    (0, common_1.Get)('echo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "echoIntegration", null);
__decorate([
    (0, common_1.Post)('echo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "echoIntegrationPost", null);
__decorate([
    (0, common_1.Get)('connectors'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "listConnectors", null);
__decorate([
    (0, common_1.Post)('connectors'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tax_integration_dto_1.CreateTaxConnectorDto]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "createConnector", null);
__decorate([
    (0, common_1.Patch)('connectors/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, tax_integration_dto_1.UpdateTaxConnectorDto]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "updateConnector", null);
__decorate([
    (0, common_1.Post)('connectors/:id/test-connection'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('connectors/:id/run-sync'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, tax_integration_dto_1.RunTaxSyncDto]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "runSync", null);
__decorate([
    (0, common_1.Get)('connectors/:id/logs'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], TaxIntegrationController.prototype, "listLogs", null);
exports.TaxIntegrationController = TaxIntegrationController = __decorate([
    (0, swagger_1.ApiTags)('tax-integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tax-integration'),
    __metadata("design:paramtypes", [tax_integration_service_1.TaxIntegrationService])
], TaxIntegrationController);
//# sourceMappingURL=tax-integration.controller.js.map