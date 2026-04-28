import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
export declare class VersionsController {
    private readonly versionsService;
    constructor(versionsService: VersionsService);
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    active(req: {
        tenantId: string;
    }, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateVersionDto): Promise<import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateVersionDto): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
