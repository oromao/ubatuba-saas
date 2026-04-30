"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalRiskService = void 0;
const common_1 = require("@nestjs/common");
let FiscalRiskService = class FiscalRiskService {
    calculateRisk(params) {
        let score = 0;
        const factors = {
            iptuStatus: 0,
            noValuation: 0,
            conflictStatus: 0,
            recentInspection: 0,
            areaDiscrepancy: 0,
            zoneChange: 0,
        };
        const iptuStatus = (params.statusIPTU || 'NAO_CADASTRADO').toUpperCase();
        if (iptuStatus === 'INADIMPLENTE') {
            factors.iptuStatus = 100;
            score += 100;
        }
        else if (iptuStatus === 'PARCELADO') {
            factors.iptuStatus = 50;
            score += 50;
        }
        else if (iptuStatus === 'ISENTO' || iptuStatus === 'QUITADO') {
            factors.iptuStatus = 0;
        }
        else if (iptuStatus === 'NAO_CADASTRADO') {
            factors.iptuStatus = 30;
            score += 30;
        }
        if (!params.valuationTotalValue && !params.valorVenalTotal) {
            factors.noValuation = 100;
            score += 100;
        }
        const status = (params.workflowStatus || params.statusCadastral || '').toUpperCase();
        if (status === 'CONFLITO' || status === 'REPROVADA') {
            factors.conflictStatus = 100;
            score += 100;
        }
        if (params.lastInspectionDate) {
            const monthsAgo = (Date.now() - new Date(params.lastInspectionDate).getTime()) / (30 * 24 * 60 * 60 * 1000);
            if (monthsAgo <= 6) {
                factors.recentInspection = -20;
                score -= 20;
            }
        }
        if (params.areaTerreno && params.areaCartografica) {
            const diff = Math.abs(params.areaTerreno - params.areaCartografica);
            const pct = diff / Math.max(params.areaTerreno, params.areaCartografica) * 100;
            if (pct > 20) {
                factors.areaDiscrepancy = 100;
                score += 100;
            }
            else if (pct > 10) {
                factors.areaDiscrepancy = 50;
                score += 50;
            }
            else if (pct > 5) {
                factors.areaDiscrepancy = 25;
                score += 25;
            }
        }
        if (params.zoneUpdatedAt) {
            const daysAgo = (Date.now() - new Date(params.zoneUpdatedAt).getTime()) / (24 * 60 * 60 * 1000);
            if (daysAgo <= 90) {
                factors.zoneChange = 30;
                score += 30;
            }
        }
        score = Math.max(0, Math.min(100, Math.round(score / 4)));
        let riskLevel = 'BAIXO';
        if (score >= 75)
            riskLevel = 'CRITICO';
        else if (score >= 50)
            riskLevel = 'ALTO';
        else if (score >= 25)
            riskLevel = 'MEDIO';
        let recommendation = '';
        if (riskLevel === 'CRITICO')
            recommendation = 'Fiscalizacao imediata recomendada. Multiplos fatores de risco.';
        else if (riskLevel === 'ALTO')
            recommendation = 'Agendar vistoria em ate 15 dias. Risco elevado detectado.';
        else if (riskLevel === 'MEDIO')
            recommendation = 'Monitorar e agendar vistoria de rotina.';
        else
            recommendation = 'Situacao regular. Manter acompanhamento periodico.';
        return {
            parcelId: params.parcelId,
            sqlu: params.sqlu,
            riskLevel,
            score,
            factors,
            recommendation,
        };
    }
    rankByRisk(parcels) {
        return parcels
            .map((p) => this.calculateRisk(p))
            .sort((a, b) => b.score - a.score);
    }
};
exports.FiscalRiskService = FiscalRiskService;
exports.FiscalRiskService = FiscalRiskService = __decorate([
    (0, common_1.Injectable)()
], FiscalRiskService);
//# sourceMappingURL=fiscal-risk.service.js.map