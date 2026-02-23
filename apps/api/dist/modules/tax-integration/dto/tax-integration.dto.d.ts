import { TaxConnectorMode } from '../tax-connector.schema';
export declare class CreateTaxConnectorDto {
    name: string;
    mode: TaxConnectorMode;
    config?: Record<string, unknown>;
    fieldMapping?: Record<string, string>;
    isActive?: boolean;
    projectId?: string;
}
export declare class UpdateTaxConnectorDto {
    name?: string;
    mode?: TaxConnectorMode;
    config?: Record<string, unknown>;
    fieldMapping?: Record<string, string>;
    isActive?: boolean;
}
export declare class RunTaxSyncDto {
    csvContent?: string;
}
