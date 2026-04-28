import { Model } from 'mongoose';
import { EnvironmentalAlert, EnvironmentalAlertDocument } from './alert.schema';
export declare class AlertsRepository {
    private readonly model;
    constructor(model: Model<EnvironmentalAlertDocument>);
    list(tenantId: string): Promise<EnvironmentalAlertDocument[]>;
    findById(tenantId: string, id: string): Promise<EnvironmentalAlertDocument | null>;
    create(data: Partial<EnvironmentalAlert>): Promise<EnvironmentalAlertDocument>;
    update(tenantId: string, id: string, data: Partial<EnvironmentalAlert>): Promise<EnvironmentalAlertDocument | null>;
    delete(tenantId: string, id: string): Promise<any>;
}
