import { CreateMembershipDto } from './dto/create-membership.dto';
import { MembershipsService } from './memberships.service';
export declare class MembershipsController {
    private readonly membershipsService;
    constructor(membershipsService: MembershipsService);
    create(dto: CreateMembershipDto): Promise<import("mongoose").Document<unknown, {}, import("./membership.schema").MembershipDocument, {}, {}> & import("./membership.schema").Membership & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
