import { ProjectsService } from '../../projects/projects.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../logradouros/logradouros.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelAuditRepository } from './parcel-audit.repository';
import { ParcelsRepository } from './parcels.repository';
type ParcelGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
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
    constructor(parcelsRepository: ParcelsRepository, projectsService: ProjectsService, parcelBuildingsService: ParcelBuildingsService, parcelSocioeconomicService: ParcelSocioeconomicService, parcelInfrastructureService: ParcelInfrastructureService, logradourosService: LogradourosService, parcelAuditRepository: ParcelAuditRepository);
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
    }): Promise<(import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    listPendencias(tenantId: string, projectId?: string): Promise<{
        parcelId: any;
        sqlu: string;
        inscription: string | undefined;
        workflowStatus: "PENDENTE" | "EM_VALIDACAO" | "APROVADA" | "REPROVADA";
        pendingIssues: string[];
    }[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getHistory(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-audit.schema").ParcelAuditLogDocument, {}, {}> & import("./parcel-audit.schema").ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(tenantId: string, dto: CreateParcelDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateParcelDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
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
    }): Promise<ParcelGeoJson>;
    getSummary(tenantId: string, projectId: string | undefined, id: string): Promise<{
        parcel: import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
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
        logradouro: (import("mongoose").Document<unknown, {}, import("../logradouros/logradouro.schema").LogradouroDocument, {}, {}> & import("../logradouros/logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    importGeojson(tenantId: string, projectId: string | undefined, featureCollection: ParcelGeoJson, userId?: string): Promise<{
        inserted: number;
        errors: number;
    }>;
}
export {};
