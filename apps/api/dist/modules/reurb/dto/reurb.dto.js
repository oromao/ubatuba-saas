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
exports.DeliverableCommandDto = exports.CompleteDocumentUploadDto = exports.RequestDocumentUploadDto = exports.UpdatePendencyStatusDto = exports.CreatePendencyDto = exports.UpdateReurbFamilyDto = exports.CreateReurbFamilyDto = exports.UpsertTenantConfigDto = exports.TenantConfigValidationRulesDto = exports.TenantConfigDocumentNamingDto = exports.TenantConfigSpreadsheetDto = exports.SpreadsheetColumnDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SpreadsheetColumnDto {
}
exports.SpreadsheetColumnDto = SpreadsheetColumnDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SpreadsheetColumnDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SpreadsheetColumnDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SpreadsheetColumnDto.prototype, "required", void 0);
class TenantConfigSpreadsheetDto {
}
exports.TenantConfigSpreadsheetDto = TenantConfigSpreadsheetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantConfigSpreadsheetDto.prototype, "templateVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SpreadsheetColumnDto),
    __metadata("design:type", Array)
], TenantConfigSpreadsheetDto.prototype, "columns", void 0);
class TenantConfigDocumentNamingDto {
}
exports.TenantConfigDocumentNamingDto = TenantConfigDocumentNamingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantConfigDocumentNamingDto.prototype, "familyFolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantConfigDocumentNamingDto.prototype, "spreadsheetFolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantConfigDocumentNamingDto.prototype, "titlesFolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantConfigDocumentNamingDto.prototype, "approvedDocumentsFolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TenantConfigDocumentNamingDto.prototype, "requiredDocumentTypes", void 0);
class TenantConfigValidationRulesDto {
}
exports.TenantConfigValidationRulesDto = TenantConfigValidationRulesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TenantConfigValidationRulesDto.prototype, "blockOnPendingDocumentIssues", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TenantConfigValidationRulesDto.prototype, "requireAptaStatusForExports", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TenantConfigValidationRulesDto.prototype, "requireAptaStatusForCartorioPackage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TenantConfigValidationRulesDto.prototype, "failOnMissingRequiredFields", void 0);
class UpsertTenantConfigDto {
}
exports.UpsertTenantConfigDto = UpsertTenantConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertTenantConfigDto.prototype, "reurbEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpsertTenantConfigDto.prototype, "requiredFamilyFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TenantConfigSpreadsheetDto),
    __metadata("design:type", TenantConfigSpreadsheetDto)
], UpsertTenantConfigDto.prototype, "spreadsheet", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TenantConfigDocumentNamingDto),
    __metadata("design:type", TenantConfigDocumentNamingDto)
], UpsertTenantConfigDto.prototype, "documentNaming", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TenantConfigValidationRulesDto),
    __metadata("design:type", TenantConfigValidationRulesDto)
], UpsertTenantConfigDto.prototype, "validationRules", void 0);
class CreateReurbFamilyDto {
}
exports.CreateReurbFamilyDto = CreateReurbFamilyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "familyCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "nucleus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "responsibleName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReurbFamilyDto.prototype, "membersCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReurbFamilyDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['APTA', 'PENDENTE', 'IRREGULAR']),
    __metadata("design:type", String)
], CreateReurbFamilyDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateReurbFamilyDto.prototype, "data", void 0);
class UpdateReurbFamilyDto {
}
exports.UpdateReurbFamilyDto = UpdateReurbFamilyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReurbFamilyDto.prototype, "nucleus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReurbFamilyDto.prototype, "responsibleName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReurbFamilyDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReurbFamilyDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateReurbFamilyDto.prototype, "membersCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateReurbFamilyDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['APTA', 'PENDENTE', 'IRREGULAR']),
    __metadata("design:type", String)
], UpdateReurbFamilyDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateReurbFamilyDto.prototype, "data", void 0);
class CreatePendencyDto {
}
exports.CreatePendencyDto = CreatePendencyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "familyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "nucleus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "missingDocument", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ABERTA', 'EM_ANALISE', 'RESOLVIDA']),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "observation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePendencyDto.prototype, "responsible", void 0);
class UpdatePendencyStatusDto {
}
exports.UpdatePendencyStatusDto = UpdatePendencyStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(['ABERTA', 'EM_ANALISE', 'RESOLVIDA']),
    __metadata("design:type", String)
], UpdatePendencyStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePendencyStatusDto.prototype, "observation", void 0);
class RequestDocumentUploadDto {
}
exports.RequestDocumentUploadDto = RequestDocumentUploadDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestDocumentUploadDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestDocumentUploadDto.prototype, "familyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestDocumentUploadDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestDocumentUploadDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestDocumentUploadDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RequestDocumentUploadDto.prototype, "metadata", void 0);
class CompleteDocumentUploadDto {
}
exports.CompleteDocumentUploadDto = CompleteDocumentUploadDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "familyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['PENDENTE', 'APROVADO', 'REPROVADO']),
    __metadata("design:type", String)
], CompleteDocumentUploadDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CompleteDocumentUploadDto.prototype, "metadata", void 0);
class DeliverableCommandDto {
}
exports.DeliverableCommandDto = DeliverableCommandDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliverableCommandDto.prototype, "projectId", void 0);
//# sourceMappingURL=reurb.dto.js.map