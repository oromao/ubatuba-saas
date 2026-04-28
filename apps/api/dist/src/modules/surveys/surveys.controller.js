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
exports.SurveysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const surveys_dto_1 = require("./dto/surveys.dto");
const surveys_service_1 = require("./surveys.service");
let SurveysController = class SurveysController {
    constructor(surveysService) {
        this.surveysService = surveysService;
    }
    list(req, projectId) {
        return this.surveysService.list(req.tenantId, projectId);
    }
    getById(req, projectId, id) {
        return this.surveysService.findById(req.tenantId, projectId, id);
    }
    create(req, dto) {
        return this.surveysService.create(req.tenantId, dto, req.user?.sub);
    }
    update(req, projectId, id, dto) {
        return this.surveysService.update(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    requestUpload(req, projectId, id, dto) {
        return this.surveysService.requestUpload(req.tenantId, projectId, id, dto);
    }
    completeUpload(req, projectId, id, dto) {
        return this.surveysService.completeUpload(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    listFiles(req, projectId, id) {
        return this.surveysService.listFiles(req.tenantId, projectId, id);
    }
    getFileDownload(req, projectId, id, fileId) {
        return this.surveysService.getFileDownload(req.tenantId, projectId, id, fileId);
    }
    updateQa(req, projectId, id, dto) {
        return this.surveysService.updateQa(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    publish(req, projectId, id) {
        return this.surveysService.publish(req.tenantId, projectId, id, req.user?.sub);
    }
};
exports.SurveysController = SurveysController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, surveys_dto_1.CreateSurveyDto]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, surveys_dto_1.UpdateSurveyDto]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/files/presign-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, surveys_dto_1.RequestSurveyUploadDto]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "requestUpload", null);
__decorate([
    (0, common_1.Post)(':id/files/complete'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, surveys_dto_1.CompleteSurveyUploadDto]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)(':id/files'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/download'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "getFileDownload", null);
__decorate([
    (0, common_1.Patch)(':id/qa'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, surveys_dto_1.UpdateSurveyQaDto]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "updateQa", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], SurveysController.prototype, "publish", null);
exports.SurveysController = SurveysController = __decorate([
    (0, swagger_1.ApiTags)('surveys'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('surveys'),
    __metadata("design:paramtypes", [surveys_service_1.SurveysService])
], SurveysController);
//# sourceMappingURL=surveys.controller.js.map