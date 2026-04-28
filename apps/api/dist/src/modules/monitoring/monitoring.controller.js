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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_environment_event_dto_1 = require("./dto/create-environment-event.dto");
const update_environment_event_dto_1 = require("./dto/update-environment-event.dto");
const monitoring_service_1 = require("./monitoring.service");
let MonitoringController = class MonitoringController {
    constructor(service) {
        this.service = service;
    }
    list(req, stage, severity, type, sourceMode, assignedTo) {
        return this.service.list(req.tenantId, { stage, severity, type, sourceMode, assignedTo });
    }
    ingest(req, dto) {
        return this.service.ingest(req.tenantId, dto, req.user?.sub);
    }
    get(req, id) {
        return this.service.findById(req.tenantId, id);
    }
    advance(req, id, dto) {
        return this.service.advance(req.tenantId, id, dto, req.user?.sub);
    }
    triage(req, id, dto) {
        return this.service.triage(req.tenantId, id, dto, req.user?.sub);
    }
    assign(req, id, dto) {
        return this.service.assign(req.tenantId, id, dto.assignedTo, req.user?.sub);
    }
    notify(req, id, dto) {
        return this.service.notify(req.tenantId, id, dto, req.user?.sub);
    }
    close(req, id, dto) {
        return this.service.close(req.tenantId, id, dto, req.user?.sub);
    }
    dashboard(req, stage, severity, type, sourceMode, assignedTo) {
        return this.service.dashboard(req.tenantId, { stage, severity, type, sourceMode, assignedTo });
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('stage')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('sourceMode')),
    __param(5, (0, common_1.Query)('assignedTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_environment_event_dto_1.CreateEnvironmentEventDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "ingest", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_environment_event_dto_1.UpdateEnvironmentEventDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "advance", null);
__decorate([
    (0, common_1.Post)('events/:id/triage'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_environment_event_dto_1.UpdateEnvironmentEventDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "triage", null);
__decorate([
    (0, common_1.Post)('events/:id/assign'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('events/:id/notify'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_environment_event_dto_1.UpdateEnvironmentEventDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "notify", null);
__decorate([
    (0, common_1.Post)('events/:id/close'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_environment_event_dto_1.UpdateEnvironmentEventDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "close", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('stage')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('sourceMode')),
    __param(5, (0, common_1.Query)('assignedTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "dashboard", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)('monitoring'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('monitoring'),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map