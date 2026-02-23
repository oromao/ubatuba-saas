import { MapFeaturesRepository } from './map-features.repository';
import { CreateMapFeatureDto } from './dto/create-map-feature.dto';
import { UpdateMapFeatureDto } from './dto/update-map-feature.dto';
import { ProjectsService } from '../projects/projects.service';
import { TenantsService } from '../tenants/tenants.service';
import { MapFeatureType } from './map-feature.schema';
export declare class MapFeaturesService {
    private readonly repository;
    private readonly projectsService;
    private readonly tenantsService;
    constructor(repository: MapFeaturesRepository, projectsService: ProjectsService, tenantsService: TenantsService);
    private toResponse;
    create(tenantId: string, dto: CreateMapFeatureDto, userId?: string): Promise<{
        id: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
        tenantSlug?: string;
        projectSlug?: string;
        featureType: MapFeatureType;
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
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateMapFeatureDto, userId?: string): Promise<{
        id: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
        tenantSlug?: string;
        projectSlug?: string;
        featureType: MapFeatureType;
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
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
    geojson(tenantId: string, projectId: string | undefined, featureType?: string, bbox?: string): Promise<{
        type: string;
        features: {
            type: string;
            id: any;
            geometry: import("../../common/utils/geo").PolygonGeometry;
            properties: {
                mapFeatureId: any;
                featureType: MapFeatureType;
            };
        }[];
    }>;
}
