import { IptuService, IptuCalculationResult, IptuBatchResult } from './iptu.service';
export declare class IptuController {
    private readonly iptuService;
    constructor(iptuService: IptuService);
    calcular(body: {
        parcelId: string;
        tenantId: string;
        projectId: string;
        year?: number;
    }): Promise<IptuCalculationResult>;
    calcularLote(body: {
        tenantId: string;
        projectId: string;
        year?: number;
        zoneId?: string;
    }): Promise<IptuBatchResult>;
    aliquota(parcelId: string): Promise<{
        aliquota: number;
        zoneCode?: string;
        zoneName?: string;
    }>;
}
