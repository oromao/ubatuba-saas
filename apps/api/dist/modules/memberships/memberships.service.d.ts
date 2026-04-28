import { MembershipsRepository } from './memberships.repository';
import { Role } from '../../common/guards/roles.decorator';
export declare class MembershipsService {
    private readonly membershipsRepository;
    constructor(membershipsRepository: MembershipsRepository);
    findByUserAndTenant(userId: string, tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./membership.schema").MembershipDocument, {}, {}> & import("./membership.schema").Membership & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: {
        tenantId: string;
        userId: string;
        role: Role;
    }): Promise<import("mongoose").Document<unknown, {}, import("./membership.schema").MembershipDocument, {}, {}> & import("./membership.schema").Membership & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
