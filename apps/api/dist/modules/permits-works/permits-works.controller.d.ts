import { CreatePermitWorkDto } from './dto/create-permit-work.dto';
import { UpdatePermitWorkDto } from './dto/update-permit-work.dto';
import { PermitsWorksService } from './permits-works.service';
export declare class PermitsWorksController {
    private readonly service;
    constructor(service: PermitsWorksService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./permit-work.schema").PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./permit-work.schema").PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreatePermitWorkDto): Promise<import("mongoose").Document<unknown, {}, import("./permit-work.schema").PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdatePermitWorkDto): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
    addEvidence(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        title: string;
        note?: string;
        fileName?: string;
    }): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
    respondRequirement(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, requirementId: string, dto: {
        note: string;
    }): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
    decide(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
        reason?: string;
    }): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
    addInvoice(req: {
        tenantId: string;
    }, id: string, dto: {
        description: string;
        amount: number;
    }): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
    issue(req: {
        tenantId: string;
    }, id: string): Promise<import("./permit-work.schema").PermitWorkRequestDocument>;
}
