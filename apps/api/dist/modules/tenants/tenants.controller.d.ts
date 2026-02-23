import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(dto: CreateTenantDto): Promise<import("mongoose").Document<unknown, {}, import("./tenant.schema").TenantDocument, {}, {}> & import("./tenant.schema").Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMe(req: {
        tenantId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./tenant.schema").TenantDocument, {}, {}> & import("./tenant.schema").Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
