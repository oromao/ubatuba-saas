import { Model } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
export declare class ProjectsRepository {
    private readonly model;
    constructor(model: Model<ProjectDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findBySlug(tenantId: string, slug: string): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findDefault(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Project>): Promise<import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, data: Partial<Project>): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, {}> & Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
