import { Model } from 'mongoose';
import { Process, ProcessDocument } from './process.schema';
import { ProcessEvent, ProcessEventDocument } from './process-event.schema';
export declare class ProcessesRepository {
    private readonly model;
    private readonly eventModel;
    constructor(model: Model<ProcessDocument>, eventModel: Model<ProcessEventDocument>);
    list(tenantId: string): Promise<ProcessDocument[]>;
    findById(tenantId: string, id: string): Promise<ProcessDocument | null>;
    create(data: Partial<Process>): Promise<ProcessDocument>;
    update(tenantId: string, id: string, data: Partial<Process>): Promise<ProcessDocument | null>;
    delete(tenantId: string, id: string): Promise<any>;
    addEvent(data: Partial<ProcessEvent>): Promise<ProcessEventDocument>;
    listEvents(tenantId: string, processId: string): Promise<ProcessEventDocument[]>;
}
