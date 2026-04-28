import { Model } from 'mongoose';
import { ParcelDocument } from '../ctm/parcels/parcel.schema';
import { Vistoria, VistoriaDocument } from '../ctm/vistoria.schema';
export declare class ReportsService {
    private parcelModel;
    private vistoriaModel;
    constructor(parcelModel: Model<ParcelDocument>, vistoriaModel: Model<VistoriaDocument>);
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
        recentes: (import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
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
            recentes: (import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
}
