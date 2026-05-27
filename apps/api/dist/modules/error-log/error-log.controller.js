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
exports.ErrorLogController = void 0;
const common_1 = require("@nestjs/common");
const error_log_service_1 = require("../../common/services/error-log.service");
let ErrorLogController = class ErrorLogController {
    constructor(service) {
        this.service = service;
    }
    async listErrors(status, unresolved, limit) {
        const filters = {};
        if (status)
            filters.status = parseInt(status, 10);
        if (unresolved === 'true')
            filters.unresolved = true;
        if (limit)
            filters.limit = parseInt(limit, 10);
        const entries = await this.service.list(filters);
        const unresolvedCount = await this.service.countUnresolved();
        return { entries, unresolvedCount, total: entries.length };
    }
    async getStats(hours) {
        return this.service.getStats(hours ? parseInt(hours, 10) : 24);
    }
    async resolveError(id) {
        await this.service.markResolved(id, 'system');
        return { resolved: true };
    }
};
exports.ErrorLogController = ErrorLogController;
__decorate([
    (0, common_1.Get)('errors'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('unresolved')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ErrorLogController.prototype, "listErrors", null);
__decorate([
    (0, common_1.Get)('errors/stats'),
    __param(0, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErrorLogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('errors/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErrorLogController.prototype, "resolveError", null);
exports.ErrorLogController = ErrorLogController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [error_log_service_1.ErrorLogService])
], ErrorLogController);
//# sourceMappingURL=error-log.controller.js.map