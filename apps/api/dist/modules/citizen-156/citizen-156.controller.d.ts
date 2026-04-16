import { CreateCitizenCallDto } from './dto/create-citizen-call.dto';
import { UpdateCitizenCallDto } from './dto/update-citizen-call.dto';
import { Citizen156Service } from './citizen-156.service';
export declare class Citizen156Controller {
    private readonly service;
    constructor(service: Citizen156Service);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    summary(req: {
        tenantId: string;
    }): Promise<{
        total: number;
        abertos: number;
        triagem: number;
        encaminhados: number;
        resolvidos: number;
        anexos: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateCitizenCallDto): Promise<import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateCitizenCallDto): Promise<import("./citizen-call.schema").CitizenCallDocument>;
}
