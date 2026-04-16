import type { PublicWorkStatus } from '../public-work.schema';
export declare class UpdatePublicWorkDto {
    status?: PublicWorkStatus;
    contractor?: string;
    message?: string;
}
