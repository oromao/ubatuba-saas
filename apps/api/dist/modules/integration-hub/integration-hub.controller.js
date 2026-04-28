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
exports.IntegrationHubController = void 0;
const common_1 = require("@nestjs/common");
const integration_hub_service_1 = require("./integration-hub.service");
let IntegrationHubController = class IntegrationHubController {
    constructor(service) {
        this.service = service;
    }
    listAdapters(req, projectId) {
        return this.service.listAdapters(req.tenantId, projectId);
    }
    portalLinks(req, projectId) {
        return this.service.portalLinks(req.tenantId, projectId);
    }
    createPortalLink(req, body, projectId) {
        return this.service.createPortalLink({
            email: body.email,
            tenantSlug: body.tenantSlug ?? req.tenantId,
            roleHint: body.roleHint,
            target: body.target,
            context: { ...body.context, projectId },
        });
    }
    createOidcLink(req, body, projectId) {
        return this.service.createOidcLink({
            ...body,
            tenantSlug: body.tenantSlug ?? req.tenantId,
            context: { ...body.context, projectId },
            target: body.target,
        });
    }
};
exports.IntegrationHubController = IntegrationHubController;
__decorate([
    (0, common_1.Get)('adapters'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationHubController.prototype, "listAdapters", null);
__decorate([
    (0, common_1.Get)('portal-links'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationHubController.prototype, "portalLinks", null);
__decorate([
    (0, common_1.Post)('portal-link'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationHubController.prototype, "createPortalLink", null);
__decorate([
    (0, common_1.Post)('oidc-link'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationHubController.prototype, "createOidcLink", null);
exports.IntegrationHubController = IntegrationHubController = __decorate([
    (0, common_1.Controller)('integration-hub'),
    __metadata("design:paramtypes", [integration_hub_service_1.IntegrationHubService])
], IntegrationHubController);
//# sourceMappingURL=integration-hub.controller.js.map