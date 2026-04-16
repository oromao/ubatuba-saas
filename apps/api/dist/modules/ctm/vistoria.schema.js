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
exports.VistoriaSchema = exports.Vistoria = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Vistoria = class Vistoria {
};
exports.Vistoria = Vistoria;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Vistoria.prototype, "parcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['INICIAL', 'REINSPECAO', 'VISTORIA_ESPECIAL', 'CONFERENCIA'] }),
    __metadata("design:type", String)
], Vistoria.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Vistoria.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Vistoria.prototype, "observacoes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['RASCUNHO', 'ENVIADA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA'], default: 'RASCUNHO' }),
    __metadata("design:type", String)
], Vistoria.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Vistoria.prototype, "fotos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ status: String, observacao: String, userId: String, timestamp: Date }], default: [] }),
    __metadata("design:type", Array)
], Vistoria.prototype, "historico", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Vistoria.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Vistoria.prototype, "operadorId", void 0);
exports.Vistoria = Vistoria = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Vistoria);
exports.VistoriaSchema = mongoose_1.SchemaFactory.createForClass(Vistoria);
exports.VistoriaSchema.index({ parcelId: 1, tenantId: 1 });
exports.VistoriaSchema.index({ tenantId: 1, status: 1 });
//# sourceMappingURL=vistoria.schema.js.map