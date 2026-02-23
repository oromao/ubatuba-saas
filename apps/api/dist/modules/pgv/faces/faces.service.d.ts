import { FacesRepository } from './faces.repository';
import { CreateFaceDto } from './dto/create-face.dto';
import { UpdateFaceDto } from './dto/update-face.dto';
import { ProjectsService } from '../../projects/projects.service';
type FaceGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: unknown;
        properties: Record<string, unknown>;
    }>;
};
export declare class FacesService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: FacesRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateFaceDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateFaceDto): Promise<(import("mongoose").Document<unknown, {}, import("./face.schema").PgvFaceDocument, {}, {}> & import("./face.schema").PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
    geojson(tenantId: string, projectId?: string, bbox?: string): Promise<FaceGeoJson>;
    importGeojson(tenantId: string, projectId: string | undefined, featureCollection: FaceGeoJson, userId?: string): Promise<{
        inserted: number;
        errors: number;
    }>;
}
export {};
