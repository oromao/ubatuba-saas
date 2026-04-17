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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_schema_1 = require("../ctm/parcels/parcel.schema");
const vistoria_schema_1 = require("../ctm/vistoria.schema");
let ReportsService = class ReportsService {
    constructor(parcelModel, vistoriaModel) {
        this.parcelModel = parcelModel;
        this.vistoriaModel = vistoriaModel;
    }
    async fiscalizacaoReport(tenantId, filters) {
        const query = { tenantId };
        if (filters.dataInicio || filters.dataFim) {
            query.data = {};
            if (filters.dataInicio)
                query.data.$gte = new Date(filters.dataInicio);
            if (filters.dataFim)
                query.data.$lte = new Date(filters.dataFim);
        }
        if (filters.status)
            query.status = filters.status;
        const [total, byStatus, byTipo, recent] = await Promise.all([
            this.vistoriaModel.countDocuments(query),
            this.vistoriaModel.aggregate([
                { $match: query },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.vistoriaModel.aggregate([
                { $match: query },
                { $group: { _id: '$tipo', count: { $sum: 1 } } },
            ]),
            this.vistoriaModel
                .find(query)
                .sort({ createdAt: -1 })
                .limit(10)
                .select('tipo data status parcelId'),
        ]);
        const aprovadas = byStatus.find((s) => s._id === 'APROVADA')?.count || 0;
        const pendentes = byStatus.find((s) => s._id === 'RASCUNHO')?.count || 0;
        return {
            resumo: {
                total,
                aprovadas,
                pendentes,
                taxaAprovacao: total > 0 ? Math.round((aprovadas / total) * 100) : 0,
            },
            porStatus: byStatus,
            porTipo: byTipo,
            recentes: recent,
            periodo: {
                inicio: filters.dataInicio || 'todos',
                fim: filters.dataFim || 'todos',
            },
        };
    }
    async parcelasReport(tenantId) {
        const [total, byStatus, byWorkflow, withPendencias] = await Promise.all([
            this.parcelModel.countDocuments({ tenantId }),
            this.parcelModel.aggregate([
                { $match: { tenantId } },
                { $group: { _id: '$statusCadastral', count: { $sum: 1 } } },
            ]),
            this.parcelModel.aggregate([
                { $match: { tenantId } },
                { $group: { _id: '$workflowStatus', count: { $sum: 1 } } },
            ]),
            this.parcelModel.countDocuments({
                tenantId,
                'pendingIssues.0': { $exists: true },
            }),
        ]);
        return {
            resumo: { total, withPendencias, semPendencias: total - withPendencias },
            porStatus: byStatus,
            porWorkflow: byWorkflow,
        };
    }
    async executivoReport(tenantId) {
        const [parcelas, vistorias] = await Promise.all([
            this.parcelasReport(tenantId),
            this.fiscalizacaoReport(tenantId, {}),
        ]);
        return { parcelas, vistorias, geradoEm: new Date().toISOString() };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_schema_1.Parcel.name)),
    __param(1, (0, mongoose_1.InjectModel)(vistoria_schema_1.Vistoria.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map