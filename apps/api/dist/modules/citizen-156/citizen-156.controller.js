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
exports.Citizen156Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_citizen_call_dto_1 = require("./dto/create-citizen-call.dto");
const update_citizen_call_dto_1 = require("./dto/update-citizen-call.dto");
const citizen_156_service_1 = require("./citizen-156.service");
let Citizen156Controller = class Citizen156Controller {
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.list(req.tenantId);
    }
    summary(req) {
        return this.service.summary(req.tenantId);
    }
    get(req, id) {
        return this.service.findById(req.tenantId, id);
    }
    create(req, dto) {
        return this.service.create(req.tenantId, dto, req.user?.sub);
    }
    update(req, id, dto) {
        return this.service.update(req.tenantId, id, dto, req.user?.sub);
    }
};
exports.Citizen156Controller = Citizen156Controller;
__decorate([
    (0, common_1.Get)('calls'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Citizen156Controller.prototype, "list", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Citizen156Controller.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('calls/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], Citizen156Controller.prototype, "get", null);
__decorate([
    (0, common_1.Post)('calls'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_citizen_call_dto_1.CreateCitizenCallDto]),
    __metadata("design:returntype", void 0)
], Citizen156Controller.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('calls/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_citizen_call_dto_1.UpdateCitizenCallDto]),
    __metadata("design:returntype", void 0)
], Citizen156Controller.prototype, "update", null);
exports.Citizen156Controller = Citizen156Controller = __decorate([
    (0, swagger_1.ApiTags)('citizen-156'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('citizen-156'),
    __metadata("design:paramtypes", [citizen_156_service_1.Citizen156Service])
], Citizen156Controller);
//# sourceMappingURL=citizen-156.controller.js.map