import { Response } from 'express';
import { ValuationsService } from './valuations.service';
import { CalculateValuationDto } from './dto/calculate-valuation.dto';
export declare class ValuationsController {
    private readonly valuationsService;
    constructor(valuationsService: ValuationsService);
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    byParcel(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    trace(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        parcelId: string;
        valuations: (import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        assessments: (import("mongoose").Document<unknown, {}, import("../assessments/assessment.schema").PgvAssessmentDocument, {}, {}> & import("../assessments/assessment.schema").PgvAssessment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        latestValuation: import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        latestAssessment: import("mongoose").Document<unknown, {}, import("../assessments/assessment.schema").PgvAssessmentDocument, {}, {}> & import("../assessments/assessment.schema").PgvAssessment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    calculate(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CalculateValuationDto): Promise<{
        parcelId: any;
        versionId: any;
        landValuePerSqm: number;
        landFactor: number;
        constructionValuePerSqm: number;
        constructionFactor: number;
        landValue: number;
        constructionValue: number;
        totalValue: number;
        breakdown: {
            zoneId: any;
            faceId: any;
            landFactorId: any;
            constructionFactorId: any;
            landValuePerSqm: number;
            constructionValuePerSqm: number;
            parcelArea: number;
            builtArea: number;
            factorSetId: import("mongoose").Types.ObjectId | null;
            fatoresTerreno: {
                tipo: string;
                chave: string;
                valorMultiplicador: number;
            }[];
            fatoresConstrucao: {
                tipo: string;
                chave: string;
                valorMultiplicador: number;
            }[];
            valoresConstrucaoM2: {
                uso: string;
                padraoConstrutivo: string;
                valorM2: number;
            }[];
            landFactorBase: number;
            constructionFactorBase: number;
        };
    }>;
    exportCsv(req: {
        tenantId: string;
    }, projectId: string | undefined, res: Response): Promise<void>;
    exportGeojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<{
        type: string;
        features: {
            type: string;
            id: any;
            geometry: import("../../../common/utils/geo").PolygonGeometry;
            properties: {
                featureType: string;
                parcelId: any;
                sqlu: string;
                inscricaoImobiliaria: string | undefined;
                inscription: string | undefined;
                enderecoPrincipal: {
                    logradouro?: string;
                    numero?: string;
                    complemento?: string;
                    bairro?: string;
                    cep?: string;
                    cidade?: string;
                    uf?: string;
                } | undefined;
                address: string | undefined;
                areaTerreno: number | undefined;
                area: number | undefined;
                statusCadastral: string | undefined;
                status: string | undefined;
                zoneId: string | null;
                faceId: string | null;
                valor_venal: number;
            };
        }[];
    }>;
    impactReport(req: {
        tenantId: string;
    }, projectId: string | undefined, baseVersionId: string, targetVersionId: string): Promise<{
        baseVersion: {
            id: string;
            name: string | null;
        };
        targetVersion: {
            id: string;
            name: string | null;
        };
        summary: {
            parcelsCompared: number;
            totalOld: number;
            totalNew: number;
            totalDelta: number;
            totalDeltaPct: number;
        };
        changes: {
            parcelId: string;
            oldValue: number;
            newValue: number;
            delta: number;
            deltaPct: number;
        }[];
    }>;
}
