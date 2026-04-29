import { MapFeaturesService } from './map-features.service';
import { CreateMapFeatureDto } from './dto/create-map-feature.dto';
import { UpdateMapFeatureDto } from './dto/update-map-feature.dto';
export declare class MapFeaturesController {
    private readonly mapFeaturesService;
    constructor(mapFeaturesService: MapFeaturesService);
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateMapFeatureDto): Promise<{
        id: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
        tenantSlug?: string;
        projectSlug?: string;
        featureType: import("./map-feature.schema").MapFeatureType;
        properties?: Record<string, unknown>;
        geometry: import("../../common/utils/geo").PolygonGeometry;
        createdBy?: import("mongoose").Types.ObjectId;
        updatedBy?: import("mongoose").Types.ObjectId;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpdateMapFeatureDto): Promise<{
        id: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
        tenantSlug?: string;
        projectSlug?: string;
        featureType: import("./map-feature.schema").MapFeatureType;
        properties?: Record<string, unknown>;
        geometry: import("../../common/utils/geo").PolygonGeometry;
        createdBy?: import("mongoose").Types.ObjectId;
        updatedBy?: import("mongoose").Types.ObjectId;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        success: boolean;
    }>;
    geojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string, featureType?: string): Promise<{
        type: string;
        features: {
            type: string;
            id: any;
            geometry: import("../../common/utils/geo").PolygonGeometry;
            properties: {
                mapFeatureId: any;
                featureType: import("./map-feature.schema").MapFeatureType;
            };
        }[];
    }>;
}
