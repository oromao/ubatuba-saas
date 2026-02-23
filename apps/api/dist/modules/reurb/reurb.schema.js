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
exports.ReurbAuditLogSchema = exports.ReurbAuditLog = exports.ReurbDeliverableSchema = exports.ReurbDeliverable = exports.ReurbDocumentPendencySchema = exports.ReurbDocumentPendency = exports.ReurbFamilySchema = exports.ReurbFamily = exports.TenantConfigSchema = exports.TenantConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TenantConfig = class TenantConfig {
};
exports.TenantConfig = TenantConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TenantConfig.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TenantConfig.prototype, "reurbEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TenantConfig.prototype, "requiredFamilyFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            templateVersion: { type: String, default: 'v1' },
            columns: {
                type: [
                    {
                        key: { type: String, required: true },
                        label: { type: String, required: true },
                        required: { type: Boolean, default: false },
                    },
                ],
                default: [],
            },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], TenantConfig.prototype, "spreadsheet", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            familyFolder: { type: String, default: 'familias' },
            spreadsheetFolder: { type: String, default: 'planilha' },
            titlesFolder: { type: String, default: 'titulos' },
            approvedDocumentsFolder: { type: String, default: 'documentos_aprovados' },
            requiredDocumentTypes: { type: [String], default: [] },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], TenantConfig.prototype, "documentNaming", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            blockOnPendingDocumentIssues: { type: Boolean, default: true },
            requireAptaStatusForExports: { type: Boolean, default: false },
            requireAptaStatusForCartorioPackage: { type: Boolean, default: true },
            failOnMissingRequiredFields: { type: Boolean, default: true },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], TenantConfig.prototype, "validationRules", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TenantConfig.prototype, "updatedBy", void 0);
exports.TenantConfig = TenantConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'tenant_configs' })
], TenantConfig);
exports.TenantConfigSchema = mongoose_1.SchemaFactory.createForClass(TenantConfig);
let ReurbFamily = class ReurbFamily {
};
exports.ReurbFamily = ReurbFamily;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbFamily.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbFamily.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbFamily.prototype, "familyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbFamily.prototype, "nucleus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbFamily.prototype, "responsibleName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReurbFamily.prototype, "cpf", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReurbFamily.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], ReurbFamily.prototype, "membersCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReurbFamily.prototype, "monthlyIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'PENDENTE' }),
    __metadata("design:type", String)
], ReurbFamily.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ReurbFamily.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                id: { type: String, required: true },
                documentType: { type: String, required: true },
                name: { type: String, required: true },
                key: { type: String, required: true },
                version: { type: Number, required: true, default: 1 },
                status: { type: String, required: true, default: 'PENDENTE' },
                metadata: { type: Object, default: {} },
                uploadedBy: { type: mongoose_2.Types.ObjectId },
                uploadedAt: { type: String, required: true },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], ReurbFamily.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbFamily.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbFamily.prototype, "updatedBy", void 0);
exports.ReurbFamily = ReurbFamily = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reurb_families' })
], ReurbFamily);
exports.ReurbFamilySchema = mongoose_1.SchemaFactory.createForClass(ReurbFamily);
exports.ReurbFamilySchema.index({ tenantId: 1, projectId: 1, familyCode: 1 }, { unique: true });
exports.ReurbFamilySchema.index({ tenantId: 1, projectId: 1, status: 1, nucleus: 1 });
let ReurbDocumentPendency = class ReurbDocumentPendency {
};
exports.ReurbDocumentPendency = ReurbDocumentPendency;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDocumentPendency.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDocumentPendency.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDocumentPendency.prototype, "familyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "nucleus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "missingDocument", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'ABERTA' }),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "observation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDocumentPendency.prototype, "responsible", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                id: { type: String, required: true },
                previousStatus: { type: String },
                nextStatus: { type: String, required: true },
                observation: { type: String },
                actorId: { type: mongoose_2.Types.ObjectId },
                at: { type: String, required: true },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], ReurbDocumentPendency.prototype, "statusHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDocumentPendency.prototype, "updatedBy", void 0);
exports.ReurbDocumentPendency = ReurbDocumentPendency = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reurb_document_pendencies' })
], ReurbDocumentPendency);
exports.ReurbDocumentPendencySchema = mongoose_1.SchemaFactory.createForClass(ReurbDocumentPendency);
exports.ReurbDocumentPendencySchema.index({ tenantId: 1, projectId: 1, status: 1, nucleus: 1 });
let ReurbDeliverable = class ReurbDeliverable {
};
exports.ReurbDeliverable = ReurbDeliverable;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDeliverable.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDeliverable.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDeliverable.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ReurbDeliverable.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDeliverable.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDeliverable.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDeliverable.prototype, "hashSha256", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], ReurbDeliverable.prototype, "validationErrors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ReurbDeliverable.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbDeliverable.prototype, "generatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbDeliverable.prototype, "generatedAt", void 0);
exports.ReurbDeliverable = ReurbDeliverable = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reurb_deliverables' })
], ReurbDeliverable);
exports.ReurbDeliverableSchema = mongoose_1.SchemaFactory.createForClass(ReurbDeliverable);
exports.ReurbDeliverableSchema.index({ tenantId: 1, projectId: 1, kind: 1, version: -1 });
let ReurbAuditLog = class ReurbAuditLog {
};
exports.ReurbAuditLog = ReurbAuditLog;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbAuditLog.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbAuditLog.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbAuditLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], ReurbAuditLog.prototype, "success", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], ReurbAuditLog.prototype, "errors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ReurbAuditLog.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReurbAuditLog.prototype, "actorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReurbAuditLog.prototype, "happenedAt", void 0);
exports.ReurbAuditLog = ReurbAuditLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reurb_audit_logs' })
], ReurbAuditLog);
exports.ReurbAuditLogSchema = mongoose_1.SchemaFactory.createForClass(ReurbAuditLog);
exports.ReurbAuditLogSchema.index({ tenantId: 1, projectId: 1, action: 1, createdAt: -1 });
//# sourceMappingURL=reurb.schema.js.map