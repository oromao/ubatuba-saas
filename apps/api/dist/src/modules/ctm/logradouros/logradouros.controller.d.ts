import { LogradourosService } from './logradouros.service';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
export declare class LogradourosController {
    private readonly logradourosService;
    constructor(logradourosService: LogradourosService);
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<import("./logradouro.schema").LogradouroDocument[]>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<import("./logradouro.schema").LogradouroDocument | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: CreateLogradouroDto): Promise<import("./logradouro.schema").LogradouroDocument>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateLogradouroDto): Promise<import("./logradouro.schema").LogradouroDocument | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<any>;
}
