"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReurbValidationService = void 0;
const common_1 = require("@nestjs/common");
let ReurbValidationService = class ReurbValidationService {
    validateBeforeDeliverable(params) {
        const errors = [];
        if (!params.config.reurbEnabled) {
            errors.push({
                code: 'REURB_DISABLED',
                message: 'Feature flag reurbEnabled esta desativada para o tenant.',
            });
            return { ok: false, errors };
        }
        if (params.families.length === 0) {
            errors.push({
                code: 'NO_FAMILIES',
                message: 'Nao existem familias beneficiarias cadastradas para o projeto.',
            });
            return { ok: false, errors };
        }
        const requiredFields = [
            ...(params.config.requiredFamilyFields ?? []),
            ...((params.config.spreadsheet?.columns ?? []).filter((col) => col.required).map((col) => col.key)),
        ];
        const requiredUnique = Array.from(new Set(requiredFields));
        if (params.config.validationRules?.failOnMissingRequiredFields !== false && requiredUnique.length > 0) {
            params.families.forEach((family) => {
                requiredUnique.forEach((field) => {
                    const fromRoot = family[field];
                    const fromData = family.data?.[field];
                    const value = fromRoot ?? fromData;
                    if (value === null || value === undefined || String(value).trim() === '') {
                        errors.push({
                            code: 'MISSING_REQUIRED_FIELD',
                            message: `Campo obrigatorio ausente: ${field}.`,
                            field,
                            familyId: String(family.id ?? ''),
                        });
                    }
                });
            });
        }
        if (params.config.validationRules?.blockOnPendingDocumentIssues !== false) {
            params.pendencies
                .filter((item) => item.status !== 'RESOLVIDA')
                .forEach((item) => {
                errors.push({
                    code: 'OPEN_DOCUMENT_PENDENCY',
                    message: `Pendencia documental aberta para ${item.documentType}.`,
                    familyId: item.familyId ? String(item.familyId) : undefined,
                });
            });
        }
        const needApta = params.action === 'GENERATE_CARTORIO_PACKAGE'
            ? params.config.validationRules?.requireAptaStatusForCartorioPackage !== false
            : params.config.validationRules?.requireAptaStatusForExports === true;
        if (needApta) {
            params.families
                .filter((family) => family.status !== 'APTA')
                .forEach((family) => {
                errors.push({
                    code: 'NON_APTA_FAMILY',
                    message: `Familia em status ${family.status} bloqueia a emissao deste entregavel.`,
                    familyId: String(family.id ?? ''),
                });
            });
        }
        return {
            ok: errors.length === 0,
            errors,
        };
    }
};
exports.ReurbValidationService = ReurbValidationService;
exports.ReurbValidationService = ReurbValidationService = __decorate([
    (0, common_1.Injectable)()
], ReurbValidationService);
//# sourceMappingURL=reurb-validation.service.js.map