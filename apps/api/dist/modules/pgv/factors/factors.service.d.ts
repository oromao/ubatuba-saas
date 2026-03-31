import { FactorsRepository } from './factors.repository';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class FactorsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: FactorsRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, category?: string): Promise<import("./factor.schema").PgvFactorDocument[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<import("./factor.schema").PgvFactorDocument | null>;
    create(tenantId: string, dto: CreateFactorDto, userId?: string): Promise<import("./factor.schema").PgvFactorDocument>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateFactorDto): Promise<import("./factor.schema").PgvFactorDocument | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
}
