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
exports.ParcelSocioeconomicSchema = exports.ParcelSocioeconomic = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ParcelSocioeconomic = class ParcelSocioeconomic {
};
exports.ParcelSocioeconomic = ParcelSocioeconomic;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSocioeconomic.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSocioeconomic.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSocioeconomic.prototype, "parcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSocioeconomic.prototype, "incomeBracket", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSocioeconomic.prototype, "faixaRenda", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ParcelSocioeconomic.prototype, "residents", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ParcelSocioeconomic.prototype, "moradores", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSocioeconomic.prototype, "vulnerabilityIndicator", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParcelSocioeconomic.prototype, "vulnerabilidade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSocioeconomic.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ParcelSocioeconomic.prototype, "updatedBy", void 0);
exports.ParcelSocioeconomic = ParcelSocioeconomic = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'parcel_socioeconomic' })
], ParcelSocioeconomic);
exports.ParcelSocioeconomicSchema = mongoose_1.SchemaFactory.createForClass(ParcelSocioeconomic);
exports.ParcelSocioeconomicSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
//# sourceMappingURL=parcel-socioeconomic.schema.js.map