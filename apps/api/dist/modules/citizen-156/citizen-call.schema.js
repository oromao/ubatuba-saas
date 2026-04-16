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
exports.CitizenCallSchema = exports.CitizenCall = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CitizenCall = class CitizenCall {
};
exports.CitizenCall = CitizenCall;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CitizenCall.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CitizenCall.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CitizenCall.prototype, "protocolNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CitizenCall.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CitizenCall.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'ABERTO' }),
    __metadata("design:type", String)
], CitizenCall.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CitizenCall.prototype, "reporterName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CitizenCall.prototype, "reporterContact", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], CitizenCall.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], CitizenCall.prototype, "attachmentKeys", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CitizenCall.prototype, "processId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CitizenCall.prototype, "alertId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], CitizenCall.prototype, "history", void 0);
exports.CitizenCall = CitizenCall = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'citizen_calls' })
], CitizenCall);
exports.CitizenCallSchema = mongoose_1.SchemaFactory.createForClass(CitizenCall);
exports.CitizenCallSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
exports.CitizenCallSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
//# sourceMappingURL=citizen-call.schema.js.map