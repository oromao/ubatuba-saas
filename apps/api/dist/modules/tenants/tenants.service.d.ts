import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsService {
    private readonly tenantsRepository;
    constructor(tenantsRepository: TenantsRepository);
    create(dto: CreateTenantDto): Promise<import("mongoose").Document<unknown, {}, import("./tenant.schema").TenantDocument, {}, {}> & import("./tenant.schema").Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./tenant.schema").TenantDocument, {}, {}> & import("./tenant.schema").Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findBySlug(slug: string): Promise<(import("mongoose").Document<unknown, {}, import("./tenant.schema").TenantDocument, {}, {}> & import("./tenant.schema").Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
