"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReconciliationService = void 0;
const common_1 = require("@nestjs/common");
let DataReconciliationService = class DataReconciliationService {
    compareParcelVsValuation(parcels, valuations) {
        const valuationMap = new Map(valuations.map((v) => [v.parcelId, v.totalValue]));
        let parcelsWithIptu = 0;
        const discrepancies = [];
        for (const parcel of parcels) {
            if (parcel.valorVenalTotal !== undefined) {
                parcelsWithIptu++;
                const valuationValue = valuationMap.get(parcel.id);
                if (valuationValue !== undefined && Math.abs(parcel.valorVenalTotal - valuationValue) > 1) {
                    discrepancies.push({
                        parcelId: parcel.id,
                        sqlu: parcel.sqlu,
                        parcelVenalTotal: parcel.valorVenalTotal,
                        valuationTotalValue: valuationValue,
                        difference: parcel.valorVenalTotal - valuationValue,
                    });
                }
            }
        }
        return {
            totalParcels: parcels.length,
            parcelsWithIptu,
            parcelsWithoutIptu: parcels.length - parcelsWithIptu,
            totalValuations: valuations.length,
            matchRate: parcels.length > 0
                ? Math.round(((parcels.length - discrepancies.length) / parcels.length) * 10000) / 100
                : 0,
            discrepancies,
        };
    }
};
exports.DataReconciliationService = DataReconciliationService;
exports.DataReconciliationService = DataReconciliationService = __decorate([
    (0, common_1.Injectable)()
], DataReconciliationService);
//# sourceMappingURL=data-reconciliation.service.js.map