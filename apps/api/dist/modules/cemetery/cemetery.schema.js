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
exports.CemeteryPlotSchema = exports.CemeteryPlot = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CemeteryPlot = class CemeteryPlot {
};
exports.CemeteryPlot = CemeteryPlot;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CemeteryPlot.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "cemeteryName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "block", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "row", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "plot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'LIVRE' }),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "ownerName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "occupantName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CemeteryPlot.prototype, "locationCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], CemeteryPlot.prototype, "documentKeys", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], CemeteryPlot.prototype, "history", void 0);
exports.CemeteryPlot = CemeteryPlot = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'cemetery_plots' })
], CemeteryPlot);
exports.CemeteryPlotSchema = mongoose_1.SchemaFactory.createForClass(CemeteryPlot);
exports.CemeteryPlotSchema.index({ tenantId: 1, cemeteryName: 1, block: 1, row: 1, plot: 1 }, { unique: true });
//# sourceMappingURL=cemetery.schema.js.map