import { Injectable } from '@nestjs/common';
import { ReurbDocumentPendency, ReurbFamily, TenantConfig } from './reurb.schema';

export type ValidationAction = 'GENERATE_PLANILHA' | 'EXPORT_BANCO_TABULADO' | 'GENERATE_CARTORIO_PACKAGE';

export type ValidationErrorItem = {
  code: string;
  message: string;
  field?: string;
  familyId?: string;
};

@Injectable()
export class ReurbValidationService {
  validateBeforeDeliverable(params: {
    config: TenantConfig;
    families: ReurbFamily[];
    pendencies: ReurbDocumentPendency[];
    action: ValidationAction;
  }) {
    const errors: ValidationErrorItem[] = [];

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
          const fromRoot = (family as unknown as Record<string, unknown>)[field];
          const fromData = family.data?.[field];
          const value = fromRoot ?? fromData;
          if (value === null || value === undefined || String(value).trim() === '') {
            errors.push({
              code: 'MISSING_REQUIRED_FIELD',
              message: `Campo obrigatorio ausente: ${field}.`,
              field,
              familyId: String((family as unknown as { id?: string }).id ?? ''),
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

    const needApta =
      params.action === 'GENERATE_CARTORIO_PACKAGE'
        ? params.config.validationRules?.requireAptaStatusForCartorioPackage !== false
        : params.config.validationRules?.requireAptaStatusForExports === true;

    if (needApta) {
      params.families
        .filter((family) => family.status !== 'APTA')
        .forEach((family) => {
          errors.push({
            code: 'NON_APTA_FAMILY',
            message: `Familia em status ${family.status} bloqueia a emissao deste entregavel.`,
            familyId: String((family as unknown as { id?: string }).id ?? ''),
          });
        });
    }

    return {
      ok: errors.length === 0,
      errors,
    };
  }
}
