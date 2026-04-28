import { Document, Types } from 'mongoose';
export declare class DashboardWidgetConfig {
    id: string;
    visible: boolean;
    order: number;
}
export declare class DashboardLayout {
    tenantId: Types.ObjectId;
    userId: Types.ObjectId;
    viewMode: 'executive' | 'operational';
    widgets: DashboardWidgetConfig[];
}
export type DashboardLayoutDocument = DashboardLayout & Document;
export declare const DashboardLayoutSchema: import("mongoose").Schema<DashboardLayout, import("mongoose").Model<DashboardLayout, any, any, any, Document<unknown, any, DashboardLayout, any, {}> & DashboardLayout & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DashboardLayout, Document<unknown, {}, import("mongoose").FlatRecord<DashboardLayout>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DashboardLayout> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
