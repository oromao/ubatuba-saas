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
exports.NotificationsLettersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const letters_dto_1 = require("./dto/letters.dto");
const notifications_letters_service_1 = require("./notifications-letters.service");
let NotificationsLettersController = class NotificationsLettersController {
    constructor(service) {
        this.service = service;
    }
    listTemplates(req, projectId) {
        return this.service.listTemplates(req.tenantId, projectId);
    }
    createTemplate(req, dto) {
        return this.service.createTemplate(req.tenantId, dto);
    }
    updateTemplate(req, projectId, id, dto) {
        return this.service.updateTemplate(req.tenantId, projectId, id, dto);
    }
    previewTemplate(dto) {
        return this.service.previewTemplate(dto);
    }
    generateBatch(req, dto) {
        return this.service.generateBatch(req.tenantId, dto, req.user?.sub);
    }
    listBatches(req, projectId) {
        return this.service.listBatches(req.tenantId, projectId);
    }
    getBatch(req, projectId, id) {
        return this.service.findBatchById(req.tenantId, projectId, id);
    }
    updateLetterStatus(req, projectId, batchId, letterId, dto) {
        return this.service.updateLetterStatus(req.tenantId, projectId, batchId, letterId, dto);
    }
    getDownloadUrl(req, projectId, batchId, letterId) {
        return this.service.getLetterDownloadUrl(req.tenantId, projectId, batchId, letterId);
    }
};
exports.NotificationsLettersController = NotificationsLettersController;
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, letters_dto_1.CreateLetterTemplateDto]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)('templates/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, letters_dto_1.UpdateLetterTemplateDto]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Post)('templates/preview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [letters_dto_1.PreviewTemplateDto]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "previewTemplate", null);
__decorate([
    (0, common_1.Post)('batches/generate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, letters_dto_1.GenerateLetterBatchDto]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "generateBatch", null);
__decorate([
    (0, common_1.Get)('batches'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "listBatches", null);
__decorate([
    (0, common_1.Get)('batches/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Patch)('batches/:batchId/letters/:letterId/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('batchId')),
    __param(3, (0, common_1.Param)('letterId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, letters_dto_1.UpdateLetterStatusDto]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "updateLetterStatus", null);
__decorate([
    (0, common_1.Get)('batches/:batchId/letters/:letterId/download'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('batchId')),
    __param(3, (0, common_1.Param)('letterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], NotificationsLettersController.prototype, "getDownloadUrl", null);
exports.NotificationsLettersController = NotificationsLettersController = __decorate([
    (0, swagger_1.ApiTags)('notifications-letters'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications-letters'),
    __metadata("design:paramtypes", [notifications_letters_service_1.NotificationsLettersService])
], NotificationsLettersController);
//# sourceMappingURL=notifications-letters.controller.js.map