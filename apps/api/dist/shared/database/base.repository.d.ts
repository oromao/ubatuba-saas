import { Model, FilterQuery, UpdateQuery, Document } from 'mongoose';
import { Logger } from '@nestjs/common';
export interface RepositoryContext {
    tenantSlug?: string;
    tenantId?: string;
    actorId?: string;
    lgpdPurpose?: string;
}
export interface BaseRepositoryConfig {
    tenantField?: string;
    useNestedAudit?: boolean;
}
export declare abstract class BaseRepository<T extends Document> {
    protected readonly model: Model<T>;
    protected readonly logger: Logger;
    protected readonly tenantField: string;
    protected readonly useNestedAudit: boolean;
    constructor(model: Model<T>, config?: BaseRepositoryConfig);
    protected checkAuditTrace(context: RepositoryContext, action: string): void;
    protected getTenantFilter(context: RepositoryContext): {
        [x: string]: string;
    };
    findWithContext(context: RepositoryContext, filter?: FilterQuery<T>): Promise<T[]>;
    findOneWithContext(context: RepositoryContext, filter: FilterQuery<T>): Promise<T | null>;
    createWithContext(context: RepositoryContext, data: Partial<T>): Promise<T>;
    updateWithContext(context: RepositoryContext, filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
}
