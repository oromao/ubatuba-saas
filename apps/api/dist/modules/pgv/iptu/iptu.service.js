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
exports.IptuService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_schema_1 = require("../../ctm/parcels/parcel.schema");
const zone_schema_1 = require("../zones/zone.schema");
const valuation_schema_1 = require("../valuations/valuation.schema");
const valuations_service_1 = require("../valuations/valuations.service");
const tenants_service_1 = require("../../tenants/tenants.service");
const calculate_valuation_dto_1 = require("../valuations/dto/calculate-valuation.dto");
let IptuService = class IptuService {
    constructor(parcelModel, zoneModel, valuationModel, valuationsService, tenantsService) {
        this.parcelModel = parcelModel;
        this.zoneModel = zoneModel;
        this.valuationModel = valuationModel;
        this.valuationsService = valuationsService;
        this.tenantsService = tenantsService;
    }
    async calculateForParcel(input) {
        const year = input.year || new Date().getFullYear();
        if (!input.parcelId || input.parcelId.length !== 24) {
            throw new Error('ID de parcela invalido');
        }
        const parcel = await this.parcelModel.findById(input.parcelId).lean().exec();
        if (!parcel) {
            throw new Error(`Parcel ${input.parcelId} not found`);
        }
        const dto = new calculate_valuation_dto_1.CalculateValuationDto();
        dto.parcelId = input.parcelId;
        dto.projectId = input.projectId;
        dto.persist = false;
        const valuationResult = await this.valuationsService.calculate(input.tenantId, dto);
        let aliquota = 0.005;
        let zoneCode = parcel.zoneamento || 'unknown';
        let zoneName = '';
        if (parcel.zoneId) {
            const zone = await this.zoneModel.findById(parcel.zoneId).lean().exec();
            if (zone) {
                zoneCode = zone.code || zone.name || zoneCode;
                zoneName = zone.name || zone.nome || zoneCode;
                aliquota = zone.aliquotaIptu ?? 0.005;
            }
        }
        if (aliquota === 0.005) {
            try {
                const tenantAliquotas = await this.tenantsService.getAliquotasPadrao(input.tenantId);
                if (tenantAliquotas.iptuResidencial) {
                    aliquota = tenantAliquotas.iptuResidencial;
                }
            }
            catch {
            }
        }
        const iptuDevido = Math.round(valuationResult.totalValue * aliquota * 100) / 100;
        return {
            parcelId: String(parcel._id),
            sqlu: parcel.sqlu || '',
            inscricaoImobiliaria: parcel.inscricaoImobiliaria || parcel.inscription,
            valorVenalTerreno: valuationResult.landValue,
            valorVenalConstrucao: valuationResult.constructionValue,
            valorVenalTotal: valuationResult.totalValue,
            aliquotaIptu: aliquota,
            iptuDevido,
            anoExercicio: year,
            zoneCode,
            zoneName,
        };
    }
    async calculateBatch(tenantId, projectId, year, zoneId) {
        const exerciseYear = year || new Date().getFullYear();
        const query = { tenantId, projectId };
        if (zoneId) {
            query.zoneId = zoneId;
        }
        const parcels = await this.parcelModel
            .find(query)
            .select('_id sqlu inscricaoImobiliaria inscription zoneamento zoneId')
            .lean()
            .exec();
        const calculos = [];
        let totalIptu = 0;
        for (const parcel of parcels) {
            try {
                const result = await this.calculateForParcel({
                    parcelId: String(parcel._id),
                    tenantId,
                    projectId,
                    year: exerciseYear,
                });
                calculos.push(result);
                totalIptu += result.iptuDevido;
            }
            catch {
            }
        }
        return {
            calculos,
            totalIptu: Math.round(totalIptu * 100) / 100,
            totalParcelas: calculos.length,
            anoExercicio: exerciseYear,
        };
    }
    async getAliquota(parcelId) {
        const parcel = await this.parcelModel.findById(parcelId).lean().exec();
        if (!parcel) {
            throw new Error(`Parcel ${parcelId} not found`);
        }
        if (parcel.zoneId) {
            const zone = await this.zoneModel.findById(parcel.zoneId).lean().exec();
            if (zone) {
                return {
                    aliquota: zone.aliquotaIptu ?? 0.005,
                    zoneCode: zone.code,
                    zoneName: zone.name || zone.nome,
                };
            }
        }
        return { aliquota: 0.005 };
    }
};
exports.IptuService = IptuService;
exports.IptuService = IptuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_schema_1.Parcel.name)),
    __param(1, (0, mongoose_1.InjectModel)(zone_schema_1.PgvZone.name)),
    __param(2, (0, mongoose_1.InjectModel)(valuation_schema_1.PgvValuation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        valuations_service_1.ValuationsService,
        tenants_service_1.TenantsService])
], IptuService);
//# sourceMappingURL=iptu.service.js.map