import { Document, Types } from 'mongoose';
export declare class Project {
    tenantId: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    isDefault: boolean;
    defaultCenter?: [number, number];
    defaultBbox?: [number, number, number, number];
    defaultZoom?: number;
    createdBy?: Types.ObjectId;
}
export type ProjectDocument = Project & Document;
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any, {}> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Project> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
