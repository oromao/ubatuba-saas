import { FacesService } from './faces.service';
import { CreateFaceDto } from './dto/create-face.dto';
import { UpdateFaceDto } from './dto/update-face.dto';
export declare class FacesController {
    private readonly facesService;
    constructor(facesService: FacesService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<import("./face.schema").PgvFaceDocument[]>;
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
    }, id: string, projectId?: string): Promise<import("./face.schema").PgvFaceDocument | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateFaceDto): Promise<import("./face.schema").PgvFaceDocument>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateFaceDto): Promise<import("./face.schema").PgvFaceDocument | null>;
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
