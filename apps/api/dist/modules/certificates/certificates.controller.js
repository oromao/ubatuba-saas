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
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/guards/public.decorator");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_certificate_dto_1 = require("./dto/create-certificate.dto");
const certificates_service_1 = require("./certificates.service");
let CertificatesController = class CertificatesController {
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.list(req.tenantId);
    }
    validatePublic(req, code, tenantId) {
        return this.service.validatePublic(tenantId ?? (typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : ''), code);
    }
    validatePublicQuery(req, code, tenantId) {
        return this.service.validatePublic(tenantId ?? (typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : ''), code);
    }
    get(req, id) {
        return this.service.findById(req.tenantId, id);
    }
    issue(req, dto) {
        return this.service.issue(req.tenantId, dto, req.user?.sub);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('validate/:code'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "validatePublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('validate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "validatePublicQuery", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_certificate_dto_1.CreateCertificateDto]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "issue", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, swagger_1.ApiTags)('certificates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('certificates'),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map