import { Model } from 'mongoose';
import { PgvFactor, PgvFactorDocument } from './factor.schema';
export declare class FactorsRepository {
    private readonly model;
    constructor(model: Model<PgvFactorDocument>);
    list(tenantId: string, projectId: string, category?: string): Promise<PgvFactorDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<PgvFactorDocument | null>;
    findDefault(tenantId: string, projectId: string, category: string): Promise<PgvFactorDocument | null>;
    create(data: Partial<PgvFactor>): Promise<PgvFactorDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvFactor>): Promise<PgvFactorDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
