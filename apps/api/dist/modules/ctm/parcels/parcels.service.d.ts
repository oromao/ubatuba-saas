import { ProjectsService } from '../../projects/projects.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../logradouros/logradouros.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelAuditRepository } from './parcel-audit.repository';
import { ParcelsRepository } from './parcels.repository';
import { ImportBatchRepository } from './import-batch.repository';
type ParcelGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id?: string;
        geometry: unknown;
        properties: Record<string, unknown>;
    }>;
};
export declare class ParcelsService {
    private readonly parcelsRepository;
    private readonly projectsService;
    private readonly parcelBuildingsService;
    private readonly parcelSocioeconomicService;
    private readonly parcelInfrastructureService;
    private readonly logradourosService;
    private readonly parcelAuditRepository;
    private readonly importBatchRepository;
    private readonly logger;
    constructor(parcelsRepository: ParcelsRepository, projectsService: ProjectsService, parcelBuildingsService: ParcelBuildingsService, parcelSocioeconomicService: ParcelSocioeconomicService, parcelInfrastructureService: ParcelInfrastructureService, logradourosService: LogradourosService, parcelAuditRepository: ParcelAuditRepository, importBatchRepository: ImportBatchRepository);
    private computePendingIssues;
    private buildDiff;
    list(tenantId: string, projectId?: string, filters?: {
        sqlu?: string;
        inscription?: string;
        inscricaoImobiliaria?: string;
        status?: string;
        workflowStatus?: string;
        bbox?: string;
        q?: string;
        sourceType?: string;
        isOfficial?: boolean;
        zoneamento?: string;
        statusIPTU?: string;
    }): Promise<import("./parcel.schema").ParcelDocument[]>;
    getStatistics(tenantId: string, projectId?: string): Promise<{
        total: number;
        official: number;
        demo: number;
        withSqlu: number;
        withIptu: number;
        totalValorVenal: number;
        totalIptuLancado: number;
        totalIptuPago: number;
        totalIptuEmAberto: number;
        inadimplentes: number;
        taxaAdimplencia: number;
        byZone: Record<string, number>;
        byStatus: Record<string, number>;
    }>;
    listPendencias(tenantId: string, projectId?: string): Promise<{
        parcelId: any;
        sqlu: string;
        inscription: string | undefined;
        workflowStatus: "PENDENTE" | "EM_VALIDACAO" | "APROVADA" | "REPROVADA";
        pendingIssues: string[];
    }[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<import("./parcel.schema").ParcelDocument | null>;
    getHistory(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-audit.schema").ParcelAuditLogDocument, {}, {}> & import("./parcel-audit.schema").ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(tenantId: string, dto: CreateParcelDto, userId?: string): Promise<import("./parcel.schema").ParcelDocument>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateParcelDto, userId?: string): Promise<import("./parcel.schema").ParcelDocument>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
    geojson(tenantId: string, projectId?: string, filters?: {
        sqlu?: string;
        inscription?: string;
        inscricaoImobiliaria?: string;
        status?: string;
        workflowStatus?: string;
        bbox?: string;
        q?: string;
        sourceType?: string;
        isOfficial?: boolean;
    }): Promise<ParcelGeoJson>;
    vectorTiles(tenantId: string, projectId: string | undefined, z: number, x: number, y: number): Promise<Buffer>;
    getSummary(tenantId: string, projectId: string | undefined, id: string): Promise<{
        parcel: import("./parcel.schema").ParcelDocument;
        building: (import("mongoose").Document<unknown, {}, import("../parcel-buildings/parcel-building.schema").ParcelBuildingDocument, {}, {}> & import("../parcel-buildings/parcel-building.schema").ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        socioeconomic: (import("mongoose").Document<unknown, {}, import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomicDocument, {}, {}> & import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        infrastructure: (import("mongoose").Document<unknown, {}, import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructureDocument, {}, {}> & import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        logradouro: import("../logradouros/logradouro.schema").LogradouroDocument | null;
    }>;
    importGeojson(tenantId: string, projectId: string | undefined, featureCollection: ParcelGeoJson, sourceType?: string, fileName?: string, upsert?: boolean, userId?: string, municipalityName?: string, municipalityCode?: string): Promise<{
        batchId: any;
        inserted: number;
        updated: number;
        skipped: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
            field?: string;
        }[];
    }>;
    transicao(tenantId: string, projectId: string | undefined, id: string, newStatus: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA', observacao: string, userId?: string, userRole?: string): Promise<import("./parcel.schema").ParcelDocument>;
    importFromCsvEnrichment(tenantId: string, projectId: string | undefined, csvContent: string, sourceType?: string, fileName?: string, columnMapping?: Record<string, string>, userId?: string): Promise<{
        batchId: string | null;
        processed: number;
        updated: number;
        notFound: number;
        errors: number;
        errorDetails: Array<{
            row: number;
            message: string;
        }>;
    }>;
}
export {};
