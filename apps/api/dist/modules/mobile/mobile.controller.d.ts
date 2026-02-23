import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileService } from './mobile.service';
export declare class MobileController {
    private readonly mobileService;
    constructor(mobileService: MobileService);
    sync(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: MobileSyncDto): Promise<{
        processed: number;
    }>;
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./mobile-field-record.schema").MobileFieldRecordDocument, {}, {}> & import("./mobile-field-record.schema").MobileFieldRecord & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
