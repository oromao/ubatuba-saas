import { Response } from 'express';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ImportGeojsonDto, ImportEnrichmentCsvDto } from './dto/import-parcel.dto';
import { UpsertParcelBuildingDto } from '../parcel-buildings/dto/upsert-parcel-building.dto';
import { UpsertParcelSocioeconomicDto } from '../parcel-socioeconomic/dto/upsert-parcel-socioeconomic.dto';
import { UpsertParcelInfrastructureDto } from '../parcel-infrastructure/dto/upsert-parcel-infrastructure.dto';
import { GeometryService } from '../geometry.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
import { ShapefileImportService } from './shapefile-import.service';
export declare class ParcelsController {
    private readonly parcelsService;
    private readonly parcelBuildingsService;
    private readonly parcelSocioeconomicService;
    private readonly parcelInfrastructureService;
    private readonly geometryService;
    private readonly shapefileImportService;
    constructor(parcelsService: ParcelsService, parcelBuildingsService: ParcelBuildingsService, parcelSocioeconomicService: ParcelSocioeconomicService, parcelInfrastructureService: ParcelInfrastructureService, geometryService: GeometryService, shapefileImportService: ShapefileImportService);
    validateGeometry(body: {
        geometry: any;
    }): import("../geometry.service").GeometryValidationResult;
    list(req: {
        tenantId: string;
    }, projectId?: string, sqlu?: string, inscription?: string, inscricaoImobiliaria?: string, status?: string, workflowStatus?: string, bbox?: string, q?: string, sourceType?: string, isOfficial?: string, zoneamento?: string, statusIPTU?: string): Promise<import("./parcel.schema").ParcelDocument[]>;
    statistics(req: {
        tenantId: string;
    }, projectId?: string): Promise<{
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
    pending(req: {
        tenantId: string;
    }, projectId?: string): Promise<{
        parcelId: any;
        sqlu: string;
        inscription: string | undefined;
        workflowStatus: "PENDENTE" | "EM_VALIDACAO" | "APROVADA" | "REPROVADA";
        pendingIssues: string[];
    }[]>;
    getAuditLog(req: {
        tenantId: string;
    }, parcelId?: string, action?: string, limit?: string, offset?: string): Promise<{
        entries: (import("mongoose").FlattenMaps<import("./parcel-audit.schema").ParcelAuditLogDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    geojson(req: {
        tenantId: string;
    }, projectId?: string, sqlu?: string, inscription?: string, inscricaoImobiliaria?: string, status?: string, workflowStatus?: string, bbox?: string, q?: string, sourceType?: string, isOfficial?: string): Promise<{
        type: "FeatureCollection";
        features: Array<{
            type: "Feature";
            id?: string;
            geometry: unknown;
            properties: Record<string, unknown>;
        }>;
    }>;
    mvt(req: {
        tenantId: string;
    }, res: Response, z: string, x: string, y: string, projectId?: string): Promise<void>;
    getPdf(id: string, req: {
        tenantId: string;
    }, res: Response): Promise<void>;
    bulkTransicao(req: {
        tenantId: string;
        user?: {
            sub?: string;
            role?: string;
        };
    }, body: {
        ids: string[];
        status: string;
        observacao: string;
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
        results: {
            id: string;
            status: string;
            message: string | undefined;
        }[];
    }>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<import("./parcel.schema").ParcelDocument | null>;
    summary(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
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
    history(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-audit.schema").ParcelAuditLogDocument, {}, {}> & import("./parcel-audit.schema").ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateParcelDto): Promise<import("./parcel.schema").ParcelDocument>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpdateParcelDto): Promise<import("./parcel.schema").ParcelDocument>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        success: boolean;
    }>;
    upsertBuilding(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpsertParcelBuildingDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-buildings/parcel-building.schema").ParcelBuildingDocument, {}, {}> & import("../parcel-buildings/parcel-building.schema").ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertSocioeconomic(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpsertParcelSocioeconomicDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomicDocument, {}, {}> & import("../parcel-socioeconomic/parcel-socioeconomic.schema").ParcelSocioeconomic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertInfrastructure(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpsertParcelInfrastructureDto): Promise<import("mongoose").Document<unknown, {}, import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructureDocument, {}, {}> & import("../parcel-infrastructure/parcel-infrastructure.schema").ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    importGeojson(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, body: ImportGeojsonDto & {
        municipalityName?: string;
        municipalityCode?: string;
    }): Promise<{
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
    importEnrichment(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, body: ImportEnrichmentCsvDto): Promise<{
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
    importCsv(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, body: {
        csv: string;
    }): Promise<{
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
    syncSftp(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined): Promise<{
        message: string;
        processedFiles: number;
        results: ({
            fileName: string;
            status: string;
            details: {
                batchId: string | null;
                processed: number;
                updated: number;
                notFound: number;
                errors: number;
                errorDetails: Array<{
                    row: number;
                    message: string;
                }>;
            };
            message?: undefined;
        } | {
            fileName: string;
            status: string;
            message: any;
            details?: undefined;
        })[];
    }>;
    sftpStatus(): Promise<{
        inboxPath: string;
        processedPath: string;
        pendingCount: number;
        pendingFiles: {
            fileName: string;
            sizeBytes: number;
            createdAt: Date;
        }[];
        processedCount: number;
        processedFiles: {
            fileName: string;
            sizeBytes: number;
            processedAt: Date;
        }[];
    }>;
    depositSftp(body: {
        fileName: string;
        csv: string;
    }): Promise<{
        success: boolean;
        fileName: string;
        filePath: string;
    }>;
    transicao(req: {
        tenantId: string;
        user?: {
            sub?: string;
            role?: string;
        };
    }, id: string, projectId: string | undefined, body: {
        status: string;
        observacao: string;
    }): Promise<import("./parcel.schema").ParcelDocument>;
    importShapefile(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, body: {
        fileBase64: string;
        filename: string;
        upsert?: boolean;
        municipalityName?: string;
        municipalityCode?: string;
    }): Promise<{
        shapefile: {
            detectedCrs: string | null;
            totalFeaturesRead: number;
            shapefileWarnings: string[];
        };
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
}
