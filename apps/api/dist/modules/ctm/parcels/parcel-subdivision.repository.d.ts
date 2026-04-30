import { Model } from 'mongoose';
import { ParcelSubdivisionDocument, SubdivisionStatus } from './parcel-subdivision.schema';
export declare class ParcelSubdivisionRepository {
    private readonly model;
    constructor(model: Model<ParcelSubdivisionDocument>);
    create(data: Record<string, unknown>): Promise<ParcelSubdivisionDocument>;
    findById(tenantId: string, id: string): Promise<ParcelSubdivisionDocument | null>;
    list(tenantId: string, projectId: string, filters?: {
        status?: SubdivisionStatus;
        tipo?: string;
        parentParcelId?: string;
    }): Promise<ParcelSubdivisionDocument[]>;
    update(id: string, tenantId: string, data: Record<string, unknown>): Promise<ParcelSubdivisionDocument | null>;
}
