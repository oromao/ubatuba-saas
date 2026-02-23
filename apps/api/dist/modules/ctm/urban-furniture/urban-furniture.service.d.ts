import { UrbanFurnitureRepository } from './urban-furniture.repository';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class UrbanFurnitureService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: UrbanFurnitureRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId: string | undefined, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, projectId: string | undefined, dto: CreateUrbanFurnitureDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateUrbanFurnitureDto): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<import("mongodb").DeleteResult>;
}
