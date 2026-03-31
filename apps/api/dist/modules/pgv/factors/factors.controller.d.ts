import { FactorsService } from './factors.service';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
export declare class FactorsController {
    private readonly factorsService;
    constructor(factorsService: FactorsService);
    list(req: {
        tenantId: string;
    }, projectId?: string, category?: string): Promise<import("./factor.schema").PgvFactorDocument[]>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<import("./factor.schema").PgvFactorDocument | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateFactorDto): Promise<import("./factor.schema").PgvFactorDocument>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateFactorDto): Promise<import("./factor.schema").PgvFactorDocument | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        success: boolean;
    }>;
}
