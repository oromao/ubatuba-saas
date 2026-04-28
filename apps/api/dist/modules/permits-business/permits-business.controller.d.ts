import { CreatePermitBusinessDto } from './dto/create-permit-business.dto';
import { UpdatePermitBusinessDto } from './dto/update-permit-business.dto';
import { PermitsBusinessService } from './permits-business.service';
export declare class PermitsBusinessController {
    private readonly service;
    constructor(service: PermitsBusinessService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreatePermitBusinessDto): Promise<import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdatePermitBusinessDto): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    addEvidence(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        title: string;
        note?: string;
        fileName?: string;
    }): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    respondRequirement(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        note: string;
    }): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    decide(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
        reason?: string;
    }): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    addTax(req: {
        tenantId: string;
    }, id: string, dto: {
        description: string;
        amount: number;
    }): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    issue(req: {
        tenantId: string;
    }, id: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    importData(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: {
        data: any;
        fileName: string;
        sourceType: string;
    }): Promise<{
        imported: number;
        updated: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
        }[];
    }>;
    importCsv(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: {
        csv: string;
        fileName: string;
        sourceType: string;
    }): Promise<{
        imported: number;
        updated: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
        }[];
    }>;
}
