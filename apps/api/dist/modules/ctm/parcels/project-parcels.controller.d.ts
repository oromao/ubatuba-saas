import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { UpsertParcelBuildingDto } from '../parcel-buildings/dto/upsert-parcel-building.dto';
import { UpsertParcelSocioeconomicDto } from '../parcel-socioeconomic/dto/upsert-parcel-socioeconomic.dto';
import { UpsertParcelInfrastructureDto } from '../parcel-infrastructure/dto/upsert-parcel-infrastructure.dto';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
export declare class ProjectParcelsController {
    private readonly parcelsService;
    private readonly parcelBuildingsService;
    private readonly parcelSocioeconomicService;
    private readonly parcelInfrastructureService;
    constructor(parcelsService: ParcelsService, parcelBuildingsService: ParcelBuildingsService, parcelSocioeconomicService: ParcelSocioeconomicService, parcelInfrastructureService: ParcelInfrastructureService);
    list(req: {
        tenantId: string;
    }, projectId: string, sqlu?: string, inscription?: string, inscricaoImobiliaria?: string, status?: string, workflowStatus?: string, bbox?: string, q?: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    pending(req: {
        tenantId: string;
    }, projectId: string): Promise<{
        parcelId: any;
        sqlu: string;
        inscription: string | undefined;
        workflowStatus: "PENDENTE" | "EM_VALIDACAO" | "APROVADA" | "REPROVADA";
        pendingIssues: string[];
    }[]>;
    geojson(req: {
        tenantId: string;
    }, projectId: string, sqlu?: string, inscription?: string, inscricaoImobiliaria?: string, status?: string, workflowStatus?: string, bbox?: string, q?: string): Promise<{
        type: "FeatureCollection";
        features: Array<{
            type: "Feature";
            id: string;
            geometry: unknown;
            properties: Record<string, unknown>;
        }>;
    }>;
    get(req: {
        tenantId: string;
    }, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    summary(req: {
        tenantId: string;
    }, projectId: string, id: string): Promise<{
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
    history(req: {
        tenantId: string;
    }, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-audit.schema").ParcelAuditLogDocument, {}, {}> & import("./parcel-audit.schema").ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, dto: CreateParcelDto): Promise<import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, id: string, dto: UpdateParcelDto): Promise<import("mongoose").Document<unknown, {}, import("./parcel.schema").ParcelDocument, {}, {}> & import("./parcel.schema").Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(req: {
        tenantId: string;
    }, projectId: string, id: string): Promise<{
        success: boolean;
    }>;
    upsertBuilding(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, id: string, dto: UpsertParcelBuildingDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-buildings/parcel-building.schema").ParcelBuildingDocument, {}, {}> & import("../parcel-buildings/parcel-building.schema").ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertSocioeconomic(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, id: string, dto: UpsertParcelSocioeconomicDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomicDocument, {}, {}> & import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertInfrastructure(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, id: string, dto: UpsertParcelInfrastructureDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructureDocument, {}, {}> & import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    importGeojson(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string, featureCollection: {
        type: 'FeatureCollection';
        features: unknown[];
    }): Promise<{
        inserted: number;
        errors: number;
    }>;
}
