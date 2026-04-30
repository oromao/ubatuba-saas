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
exports.ParcelSubdivisionSchema = exports.ParcelSubdivision = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ParcelSubdivision = class ParcelSubdivision {
};
exports.ParcelSubdivision = ParcelSubdivision;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "parentParcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'RASCUNHO' }),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "numeroProcesso", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "motivo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "observacoes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ParcelSubdivision.prototype, "requerente", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, required: true }),
    __metadata("design:type", Array)
], ParcelSubdivision.prototype, "childDefinitions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId }] }),
    __metadata("design:type", Array)
], ParcelSubdivision.prototype, "childParcelIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ tipo: String, url: String, nome: String }] }),
    __metadata("design:type", Array)
], ParcelSubdivision.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "aprovadoPor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ParcelSubdivision.prototype, "aprovadoEm", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "rejeitadoPor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ParcelSubdivision.prototype, "rejeitadoEm", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSubdivision.prototype, "motivoRejeicao", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSubdivision.prototype, "updatedBy", void 0);
exports.ParcelSubdivision = ParcelSubdivision = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'subdivision_requests' })
], ParcelSubdivision);
exports.ParcelSubdivisionSchema = mongoose_1.SchemaFactory.createForClass(ParcelSubdivision);
exports.ParcelSubdivisionSchema.index({ tenantId: 1, projectId: 1 });
exports.ParcelSubdivisionSchema.index({ tenantId: 1, parentParcelId: 1 });
exports.ParcelSubdivisionSchema.index({ tenantId: 1, status: 1 });
exports.ParcelSubdivisionSchema.index({ numeroProcesso: 1 }, { sparse: true });
//# sourceMappingURL=parcel-subdivision.schema.js.map