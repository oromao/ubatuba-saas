import { FacesService } from './faces.service';
import { CreateFaceDto } from './dto/create-face.dto';
import { UpdateFaceDto } from './dto/update-face.dto';
export declare class FacesController {
    private readonly facesService;
    constructor(facesService: FacesService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateFaceDto): Promise<import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateFaceDto): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
