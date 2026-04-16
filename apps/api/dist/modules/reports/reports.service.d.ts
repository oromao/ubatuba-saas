import { Model } from 'mongoose';
export declare class ReportsService {
    private parcelModel;
    private vistoriaModel;
    constructor(parcelModel: Model<any>, vistoriaModel: Model<any>);
    fiscalizacaoReport(tenantId: string, filters: {
        dataInicio?: string;
        dataFim?: string;
        status?: string;
    }): Promise<{
        resumo: {
            total: number;
            aprovadas: any;
            pendentes: any;
            taxaAprovacao: number;
        };
        porStatus: any[];
        porTipo: any[];
        recentes: any[];
        periodo: {
            inicio: string;
            fim: string;
        };
    }>;
    parcelasReport(tenantId: string): Promise<{
        resumo: {
            total: number;
            withPendencias: number;
            semPendencias: number;
        };
        porStatus: any[];
        porWorkflow: any[];
    }>;
    executivoReport(tenantId: string): Promise<{
        parcelas: {
            resumo: {
                total: number;
                withPendencias: number;
                semPendencias: number;
            };
            porStatus: any[];
            porWorkflow: any[];
        };
        vistorias: {
            resumo: {
                total: number;
                aprovadas: any;
                pendentes: any;
                taxaAprovacao: number;
            };
            porStatus: any[];
            porTipo: any[];
            recentes: any[];
            periodo: {
                inicio: string;
                fim: string;
            };
        };
        geradoEm: string;
    }>;
}
