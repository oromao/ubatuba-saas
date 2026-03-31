import { Model } from 'mongoose';
import { PgvZone, PgvZoneDocument } from './zone.schema';
export declare class ZonesRepository {
    private readonly model;
    constructor(model: Model<PgvZoneDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<PgvZoneDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<PgvZoneDocument | null>;
    findByGeometry(tenantId: string, projectId: string, geometry: unknown): Promise<PgvZoneDocument | null>;
    create(data: Partial<PgvZone>): Promise<PgvZoneDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvZone>): Promise<PgvZoneDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
