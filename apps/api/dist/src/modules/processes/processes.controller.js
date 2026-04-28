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
exports.ProcessesController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_process_dto_1 = require("./dto/create-process.dto");
const transition_dto_1 = require("./dto/transition.dto");
const update_process_dto_1 = require("./dto/update-process.dto");
const processes_service_1 = require("./processes.service");
let ProcessesController = class ProcessesController {
    constructor(processesService) {
        this.processesService = processesService;
    }
    list(req) {
        return this.processesService.list(req.tenantId);
    }
    get(req, id) {
        return this.processesService.findById(req.tenantId, id);
    }
    create(req, dto) {
        return this.processesService.create(req.tenantId, dto);
    }
    update(req, id, dto) {
        return this.processesService.update(req.tenantId, id, dto);
    }
    transition(req, id, dto) {
        return this.processesService.transition(req.tenantId, id, dto);
    }
    events(req, id) {
        return this.processesService.events(req.tenantId, id);
    }
    remove(req, id) {
        return this.processesService.remove(req.tenantId, id);
    }
};
exports.ProcessesController = ProcessesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_process_dto_1.CreateProcessDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_process_dto_1.UpdateProcessDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, transition_dto_1.TransitionDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "transition", null);
__decorate([
    (0, common_1.Get)(':id/events'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "events", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "remove", null);
exports.ProcessesController = ProcessesController = __decorate([
    (0, common_1.Controller)('processes'),
    __metadata("design:paramtypes", [processes_service_1.ProcessesService])
], ProcessesController);
//# sourceMappingURL=processes.controller.js.map