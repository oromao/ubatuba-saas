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
exports.LgpdAuditSchema = exports.LgpdAudit = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let LgpdAudit = class LgpdAudit {
};
exports.LgpdAudit = LgpdAudit;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LgpdAudit.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LgpdAudit.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LgpdAudit.prototype, "resourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LgpdAudit.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], LgpdAudit.prototype, "fields", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LgpdAudit.prototype, "actorId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LgpdAudit.prototype, "actorRole", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LgpdAudit.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LgpdAudit.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LgpdAudit.prototype, "consentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LgpdAudit.prototype, "anonymized", void 0);
exports.LgpdAudit = LgpdAudit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'lgpd_audit' })
], LgpdAudit);
exports.LgpdAuditSchema = mongoose_1.SchemaFactory.createForClass(LgpdAudit);
exports.LgpdAuditSchema.index({ tenantId: 1, createdAt: -1 });
exports.LgpdAuditSchema.index({ resourceType: 1, resourceId: 1 });
//# sourceMappingURL=lgpd-audit.schema.js.map