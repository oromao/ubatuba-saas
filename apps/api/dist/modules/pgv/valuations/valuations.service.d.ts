import { ValuationsRepository } from './valuations.repository';
import { CalculateValuationDto } from './dto/calculate-valuation.dto';
import { RecalculateBatchDto } from './dto/recalculate-batch.dto';
import { ProjectsService } from '../../projects/projects.service';
import { ParcelsRepository } from '../../ctm/parcels/parcels.repository';
import { ParcelBuildingsRepository } from '../../ctm/parcel-buildings/parcel-buildings.repository';
import { ZonesRepository } from '../zones/zones.repository';
import { FacesRepository } from '../faces/faces.repository';
import { FactorsRepository } from '../factors/factors.repository';
import { FactorSetsRepository } from '../factor-sets/factor-sets.repository';
import { VersionsService } from '../versions/versions.service';
import { AssessmentsRepository } from '../assessments/assessments.repository';
export declare class ValuationsService {
    private readonly repository;
    private readonly projectsService;
    private readonly parcelsRepository;
    private readonly parcelBuildingsRepository;
    private readonly zonesRepository;
    private readonly facesRepository;
    private readonly factorsRepository;
    private readonly factorSetsRepository;
    private readonly versionsService;
    private readonly assessmentsRepository;
    constructor(repository: ValuationsRepository, projectsService: ProjectsService, parcelsRepository: ParcelsRepository, parcelBuildingsRepository: ParcelBuildingsRepository, zonesRepository: ZonesRepository, facesRepository: FacesRepository, factorsRepository: FactorsRepository, factorSetsRepository: FactorSetsRepository, versionsService: VersionsService, assessmentsRepository: AssessmentsRepository);
    list(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    byParcel(tenantId: string, projectId: string | undefined, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, import("./valuation.schema").PgvValuationDocument, {}, {}> & import("./valuation.schema").PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    calculate(tenantId: string, dto: CalculateValuationDto, userId?: string): Promise<{
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
    exportCsv(tenantId: string, projectId?: string): Promise<string>;
    exportParcelsGeojson(tenantId: string, projectId?: string, bbox?: string): Promise<{
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
    recalculateBatch(tenantId: string, dto: RecalculateBatchDto, userId?: string): Promise<{
        processed: number;
    }>;
    getCalculationTrace(tenantId: string, projectId: string | undefined, parcelId: string): Promise<{
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
    getImpactReport(tenantId: string, projectId: string | undefined, baseVersionId: string, targetVersionId: string): Promise<{
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
