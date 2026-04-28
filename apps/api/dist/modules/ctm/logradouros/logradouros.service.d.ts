import { LogradourosRepository } from './logradouros.repository';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class LogradourosService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: LogradourosRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId: string | undefined): Promise<import("./logradouro.schema").LogradouroDocument[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<import("./logradouro.schema").LogradouroDocument | null>;
    create(tenantId: string, projectId: string | undefined, dto: CreateLogradouroDto, userId?: string): Promise<import("./logradouro.schema").LogradouroDocument>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateLogradouroDto): Promise<import("./logradouro.schema").LogradouroDocument | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<any>;
}
