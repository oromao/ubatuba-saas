import { Model } from 'mongoose';
import { PgvFace, PgvFaceDocument } from './face.schema';
export declare class FacesRepository {
    private readonly model;
    constructor(model: Model<PgvFaceDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<PgvFaceDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<PgvFaceDocument | null>;
    findByGeometry(tenantId: string, projectId: string, geometry: unknown): Promise<PgvFaceDocument | null>;
    create(data: Partial<PgvFace>): Promise<PgvFaceDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvFace>): Promise<PgvFaceDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
