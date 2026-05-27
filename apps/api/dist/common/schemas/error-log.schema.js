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
exports.ErrorLogSchema = exports.ErrorLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ErrorLog = class ErrorLog {
};
exports.ErrorLog = ErrorLog;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ErrorLog.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "detail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "trace", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "errorCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "correlationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ErrorLog.prototype, "resolved", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ErrorLog.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "resolvedBy", void 0);
exports.ErrorLog = ErrorLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'error_logs' })
], ErrorLog);
exports.ErrorLogSchema = mongoose_1.SchemaFactory.createForClass(ErrorLog);
exports.ErrorLogSchema.index({ createdAt: -1 });
exports.ErrorLogSchema.index({ status: 1, createdAt: -1 });
exports.ErrorLogSchema.index({ resolved: 1, createdAt: -1 });
//# sourceMappingURL=error-log.schema.js.map