import { Response } from 'express';
import { ValuationsService } from './valuations/valuations.service';
import { CalculateValuationDto } from './valuations/dto/calculate-valuation.dto';
import { RecalculateBatchDto } from './valuations/dto/recalculate-batch.dto';
export declare class PgvController {
    private readonly valuationsService;
    constructor(valuationsService: ValuationsService);
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
    recalculateBatch(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: RecalculateBatchDto): Promise<{
        processed: number;
    }>;
    reportCsv(req: {
        tenantId: string;
    }, projectId: string | undefined, res: Response): Promise<void>;
    parcelsGeojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<{
        type: string;
        features: {
            type: string;
            id: any;
            geometry: import("../../common/utils/geo").PolygonGeometry;
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
}
