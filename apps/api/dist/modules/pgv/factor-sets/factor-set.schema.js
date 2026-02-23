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
exports.PgvFactorSetSchema = exports.PgvFactorSet = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PgvFactorSet = class PgvFactorSet {
};
exports.PgvFactorSet = PgvFactorSet;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PgvFactorSet.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PgvFactorSet.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ tipo: String, chave: String, valorMultiplicador: Number }],
        default: [],
    }),
    __metadata("design:type", Array)
], PgvFactorSet.prototype, "fatoresTerreno", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ tipo: String, chave: String, valorMultiplicador: Number }],
        default: [],
    }),
    __metadata("design:type", Array)
], PgvFactorSet.prototype, "fatoresConstrucao", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ uso: String, padraoConstrutivo: String, valorM2: Number }],
        default: [],
    }),
    __metadata("design:type", Array)
], PgvFactorSet.prototype, "valoresConstrucaoM2", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PgvFactorSet.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PgvFactorSet.prototype, "updatedBy", void 0);
exports.PgvFactorSet = PgvFactorSet = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'pgv_factor_sets' })
], PgvFactorSet);
exports.PgvFactorSetSchema = mongoose_1.SchemaFactory.createForClass(PgvFactorSet);
exports.PgvFactorSetSchema.index({ tenantId: 1, projectId: 1 }, { unique: true });
//# sourceMappingURL=factor-set.schema.js.map