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
exports.ErrorLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const error_log_schema_1 = require("../schemas/error-log.schema");
let ErrorLogService = class ErrorLogService {
    constructor(model) {
        this.model = model;
    }
    async log(entry) {
        await this.model.create({
            status: entry.status,
            method: entry.method,
            url: entry.url,
            detail: entry.detail?.slice(0, 2000),
            trace: entry.trace?.slice(0, 5000),
            errorCode: entry.errorCode,
            tenantId: entry.tenantId,
            userId: entry.userId,
            correlationId: entry.correlationId,
            resolved: false,
        });
    }
    async list(filters) {
        const query = {};
        if (filters?.status)
            query.status = filters.status;
        if (filters?.unresolved)
            query.resolved = false;
        if (filters?.tenantId)
            query.tenantId = filters.tenantId;
        return this.model
            .find(query)
            .sort({ createdAt: -1 })
            .limit(filters?.limit ?? 50)
            .exec();
    }
    async countUnresolved() {
        return this.model.countDocuments({ resolved: false }).exec();
    }
    async markResolved(id, by) {
        await this.model.updateOne({ _id: id }, { $set: { resolved: true, resolvedAt: new Date(), resolvedBy: by } }).exec();
    }
    async getStats(hours = 24) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const recent = await this.model.find({ createdAt: { $gte: since } }).exec();
        const serverErrors = recent.filter((e) => e.status >= 500).length;
        const clientErrors = recent.filter((e) => e.status >= 400 && e.status < 500).length;
        const endpointCount = {};
        for (const e of recent) {
            const key = `${e.method} ${e.url}`;
            endpointCount[key] = (endpointCount[key] ?? 0) + 1;
        }
        return {
            total: recent.length,
            serverErrors,
            clientErrors,
            unresolved: await this.countUnresolved(),
            topEndpoints: Object.entries(endpointCount)
                .map(([url, count]) => ({ url, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
        };
    }
};
exports.ErrorLogService = ErrorLogService;
exports.ErrorLogService = ErrorLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(error_log_schema_1.ErrorLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ErrorLogService);
//# sourceMappingURL=error-log.service.js.map