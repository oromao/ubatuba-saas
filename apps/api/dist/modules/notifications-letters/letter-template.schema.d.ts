import { Document, Types } from 'mongoose';
export declare class LetterTemplate {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    version: number;
    html: string;
    variables: string[];
    isActive: boolean;
}
export type LetterTemplateDocument = LetterTemplate & Document;
export declare const LetterTemplateSchema: import("mongoose").Schema<LetterTemplate, import("mongoose").Model<LetterTemplate, any, any, any, Document<unknown, any, LetterTemplate, any, {}> & LetterTemplate & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LetterTemplate, Document<unknown, {}, import("mongoose").FlatRecord<LetterTemplate>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LetterTemplate> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
