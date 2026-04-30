"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxBillService = void 0;
const common_1 = require("@nestjs/common");
let TaxBillService = class TaxBillService {
    generateTaxBill(params) {
        const numeroParcelas = params.numeroParcelas || 12;
        const iptuTotal = Math.round(params.valorVenalTotal * params.aliquotaIptu * 100) / 100;
        const valorParcela = Math.round((iptuTotal / numeroParcelas) * 100) / 100;
        const descontoUnico = Math.round(iptuTotal * 0.1 * 100) / 100;
        const parcelas = [];
        for (let i = 0; i < numeroParcelas; i++) {
            const vencimento = new Date(params.anoExercicio, i, 15);
            parcelas.push({
                numero: i + 1,
                vencimento: vencimento.toISOString().slice(0, 10),
                valor: valorParcela,
                status: 'PENDENTE',
            });
        }
        return {
            id: `IPTU-${params.anoExercicio}-${params.parcelId.slice(-6)}`,
            parcelId: params.parcelId,
            sqlu: params.sqlu,
            contribuinte: params.contribuinte,
            anoExercicio: params.anoExercicio,
            valorVenalTotal: params.valorVenalTotal,
            aliquotaIptu: params.aliquotaIptu,
            iptuTotal,
            parcelas,
            descontoPagamentoUnico: descontoUnico,
        };
    }
    calculateCollectionSummary(bills) {
        const totalLancado = bills.reduce((sum, b) => sum + b.iptuTotal, 0);
        const totalParcelas = bills.reduce((sum, b) => sum + b.parcelas.length, 0);
        const mediaValorVenal = bills.length > 0
            ? bills.reduce((sum, b) => sum + b.valorVenalTotal, 0) / bills.length
            : 0;
        return {
            totalLancado: Math.round(totalLancado * 100) / 100,
            totalParcelas,
            mediaValorVenal: Math.round(mediaValorVenal * 100) / 100,
        };
    }
    getDefaultParcelas(iptuTotal) {
        if (iptuTotal < 100)
            return 6;
        if (iptuTotal < 500)
            return 8;
        if (iptuTotal < 1000)
            return 10;
        return 12;
    }
};
exports.TaxBillService = TaxBillService;
exports.TaxBillService = TaxBillService = __decorate([
    (0, common_1.Injectable)()
], TaxBillService);
//# sourceMappingURL=tax-bill.service.js.map