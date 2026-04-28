import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getExecutiveReport(req: any): Promise<{
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
            recentes: (import("mongoose").Document<unknown, {}, import("../ctm/vistoria.schema").VistoriaDocument, {}, {}> & import("../ctm/vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            periodo: {
                inicio: string;
                fim: string;
            };
        };
        geradoEm: string;
    }>;
    getFiscalizacaoReport(req: any, dataInicio?: string, dataFim?: string, status?: string): Promise<{
        resumo: {
            total: number;
            aprovadas: any;
            pendentes: any;
            taxaAprovacao: number;
        };
        porStatus: any[];
        porTipo: any[];
        recentes: (import("mongoose").Document<unknown, {}, import("../ctm/vistoria.schema").VistoriaDocument, {}, {}> & import("../ctm/vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        periodo: {
            inicio: string;
            fim: string;
        };
    }>;
    getParcelsReport(req: any): Promise<{
        resumo: {
            total: number;
            withPendencias: number;
            semPendencias: number;
        };
        porStatus: any[];
        porWorkflow: any[];
    }>;
}
