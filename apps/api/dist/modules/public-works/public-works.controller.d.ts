import { DeleteResult } from 'mongoose';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddMeasurementDto } from './dto/add-measurement.dto';
import { AdvancePublicWorkDto } from './dto/advance-public-work.dto';
import { CreatePublicWorkDto } from './dto/create-public-work.dto';
import { UpdatePublicWorkDto } from './dto/update-public-work.dto';
import { PublicWorksService } from './public-works.service';
export declare class PublicWorksController {
    private readonly service;
    constructor(service: PublicWorksService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    summary(req: {
        tenantId: string;
    }): Promise<{
        total: number;
        planejadas: number;
        execucao: number;
        contratadas: number;
        concluidas: number;
        progressoMedio: number;
        medicoes: number;
        evidencias: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreatePublicWorkDto): Promise<import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdatePublicWorkDto): Promise<import("./public-work.schema").PublicWorkDocument>;
    advanceStage(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: AdvancePublicWorkDto): Promise<import("./public-work.schema").PublicWorkDocument>;
    addMeasurement(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: AddMeasurementDto): Promise<import("./public-work.schema").PublicWorkDocument>;
    addEvidence(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: AddEvidenceDto): Promise<import("./public-work.schema").PublicWorkDocument>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<DeleteResult>;
}
