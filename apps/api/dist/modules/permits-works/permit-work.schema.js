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
exports.PermitWorkRequestSchema = exports.PermitWorkRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PermitWorkRequest = class PermitWorkRequest {
};
exports.PermitWorkRequest = PermitWorkRequest;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PermitWorkRequest.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PermitWorkRequest.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "protocolNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "applicantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "subjectAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'ABERTO' }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'ABERTURA' }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "currentStage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "responsibleDepartment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], PermitWorkRequest.prototype, "history", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], PermitWorkRequest.prototype, "requirements", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], PermitWorkRequest.prototype, "evidences", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], PermitWorkRequest.prototype, "invoices", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PermitWorkRequest.prototype, "decisionPdfKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PermitWorkRequest.prototype, "parcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PermitWorkRequest.prototype, "validUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PermitWorkRequest.prototype, "decision", void 0);
exports.PermitWorkRequest = PermitWorkRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'permit_work_requests' })
], PermitWorkRequest);
exports.PermitWorkRequestSchema = mongoose_1.SchemaFactory.createForClass(PermitWorkRequest);
exports.PermitWorkRequestSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
exports.PermitWorkRequestSchema.index({ tenantId: 1, parcelId: 1 });
//# sourceMappingURL=permit-work.schema.js.map