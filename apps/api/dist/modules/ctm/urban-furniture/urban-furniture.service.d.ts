import { UrbanFurnitureRepository } from './urban-furniture.repository';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class UrbanFurnitureService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: UrbanFurnitureRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId: string | undefined, bbox?: string): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument | null>;
    create(tenantId: string, projectId: string | undefined, dto: CreateUrbanFurnitureDto, userId?: string): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateUrbanFurnitureDto): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<any>;
}
