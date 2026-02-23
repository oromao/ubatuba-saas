import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
export declare class ZonesController {
    private readonly zonesService;
    constructor(zonesService: ZonesService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<{
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
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateZoneDto): Promise<import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateZoneDto): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        success: boolean;
    }>;
    importGeojson(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, featureCollection: {
        type: 'FeatureCollection';
        features: unknown[];
    }): Promise<{
        inserted: number;
        errors: number;
    }>;
}
