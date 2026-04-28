import { Role } from '../../../common/guards/roles.decorator';
export declare class CreateMembershipDto {
    tenantId: string;
    userId: string;
    role: Role;
}
