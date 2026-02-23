import { ReurbDocumentPendency, ReurbFamily, TenantConfig } from './reurb.schema';
export type ValidationAction = 'GENERATE_PLANILHA' | 'EXPORT_BANCO_TABULADO' | 'GENERATE_CARTORIO_PACKAGE';
export type ValidationErrorItem = {
    code: string;
    message: string;
    field?: string;
    familyId?: string;
};
export declare class ReurbValidationService {
    validateBeforeDeliverable(params: {
        config: TenantConfig;
        families: ReurbFamily[];
        pendencies: ReurbDocumentPendency[];
        action: ValidationAction;
    }): {
        ok: boolean;
        errors: ValidationErrorItem[];
    };
}
