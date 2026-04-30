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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelSchema = exports.Parcel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Parcel = class Parcel {
};
exports.Parcel = Parcel;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Parcel.prototype, "sqlu", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "inscricaoImobiliaria", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "inscription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Parcel.prototype, "enderecoPrincipal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "mainAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "codigoImovel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "setor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "quadra", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "lote", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "cep", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "zoneamento", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "areaTerreno", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "area", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "areaConstruida", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "areaCartografica", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "valorVenalTerreno", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "valorVenalConstrucao", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "valorVenalTotal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "iptuLancado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "iptuPago", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "iptuEmAberto", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "statusIPTU", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Parcel.prototype, "exercicioIPTU", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "proprietarioNome", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "proprietarioDocumento", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'DEMO' }),
    __metadata("design:type", String)
], Parcel.prototype, "sourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "municipalityName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "municipalityCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "importBatchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Parcel.prototype, "isOfficial", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Parcel.prototype, "active", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'VALID' }),
    __metadata("design:type", String)
], Parcel.prototype, "validationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Parcel.prototype, "validationErrors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Parcel.prototype, "centroid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Parcel.prototype, "bbox", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Parcel.prototype, "geometry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Parcel.prototype, "rawProperties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "statusCadastral", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "observacoes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'PENDENTE' }),
    __metadata("design:type", String)
], Parcel.prototype, "workflowStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Parcel.prototype, "pendingIssues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "logradouroId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "zoneId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "faceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "parentParcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Parcel.prototype, "subdivisionRequestId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Parcel.prototype, "originType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Parcel.prototype, "subdivisionDate", void 0);
exports.Parcel = Parcel = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'parcels' })
], Parcel);
exports.ParcelSchema = mongoose_1.SchemaFactory.createForClass(Parcel);
exports.ParcelSchema.index({ tenantId: 1, projectId: 1, sqlu: 1 }, { unique: true });
exports.ParcelSchema.index({ tenantId: 1, projectId: 1, inscription: 1 });
exports.ParcelSchema.index({ tenantId: 1, projectId: 1, inscricaoImobiliaria: 1 });
exports.ParcelSchema.index({ tenantId: 1, projectId: 1, updatedAt: -1 });
exports.ParcelSchema.index({ geometry: '2dsphere' });
exports.ParcelSchema.index({ centroid: '2dsphere' });
exports.ParcelSchema.index({ sourceType: 1 });
exports.ParcelSchema.index({ isOfficial: 1 });
exports.ParcelSchema.index({ importBatchId: 1 });
exports.ParcelSchema.index({ statusIPTU: 1 });
exports.ParcelSchema.index({ zoneamento: 1 });
exports.ParcelSchema.index({ municipalityName: 1 });
exports.ParcelSchema.index({ setor: 1, quadra: 1, lote: 1 });
exports.ParcelSchema.index({ tenantId: 1, parentParcelId: 1 });
exports.ParcelSchema.index({ tenantId: 1, subdivisionRequestId: 1 });
//# sourceMappingURL=parcel.schema.js.map