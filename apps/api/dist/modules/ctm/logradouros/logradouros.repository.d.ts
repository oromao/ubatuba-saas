import { Model } from 'mongoose';
import { Logradouro, LogradouroDocument } from './logradouro.schema';
export declare class LogradourosRepository {
    private readonly model;
    constructor(model: Model<LogradouroDocument>);
    list(tenantId: string, projectId: string): Promise<LogradouroDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<LogradouroDocument | null>;
    create(data: Partial<Logradouro>): Promise<LogradouroDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<Logradouro>): Promise<LogradouroDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
