import { Model, FilterQuery, UpdateQuery, Document } from 'mongoose';
import { Logger } from '@nestjs/common';

/**
 * Contexto Base Obrigatório para operações em Módulos REURB / PGV.
 * Exige tenantSlug para isolamento de dados e lgpdPurpose para auditoria obrigatória.
 */
export interface RepositoryContext {
  tenantSlug?: string;
  tenantId?: string;
  actorId?: string;
  lgpdPurpose?: string;
}

export interface BaseRepositoryConfig {
  tenantField?: string;
  useNestedAudit?: boolean; // Se true, usa 'audit.createdBy'. Se false, usa 'createdBy' na raiz
}

export abstract class BaseRepository<T extends Document> {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly tenantField: string;
  protected readonly useNestedAudit: boolean;

  constructor(
    protected readonly model: Model<T>,
    config?: BaseRepositoryConfig
  ) {
    this.tenantField = config?.tenantField ?? 'tenant.slug';
    this.useNestedAudit = config?.useNestedAudit ?? true;
  }

  protected checkAuditTrace(context: RepositoryContext, action: string) {
    if (!context.lgpdPurpose) {
      this.logger.warn(
        `[AUDIT_ALERT] Operacao '${action}' no model '${this.model.modelName}' ocorreu sem especificacao do 'x-lgpd-purpose' (Quebra de rastreabilidade REURB-S).`
      );
    }
  }

  protected getTenantFilter(context: RepositoryContext) {
    const value = this.tenantField === 'tenantId' ? context.tenantId : context.tenantSlug;
    if (!value) throw new Error(`Missing tenant identifier for ${this.tenantField}`);
    return { [this.tenantField]: value };
  }

  async findWithContext(context: RepositoryContext, filter: FilterQuery<T> = {}): Promise<T[]> {
    this.checkAuditTrace(context, 'FIND_MANY');
    const safeFilter = { ...filter, ...this.getTenantFilter(context) };
    return this.model.find(safeFilter).exec();
  }

  async findOneWithContext(context: RepositoryContext, filter: FilterQuery<T>): Promise<T | null> {
    this.checkAuditTrace(context, 'FIND_ONE');
    const safeFilter = { ...filter, ...this.getTenantFilter(context) };
    return this.model.findOne(safeFilter).exec();
  }

  async createWithContext(context: RepositoryContext, data: Partial<T>): Promise<T> {
    this.checkAuditTrace(context, 'CREATE');
    
    // Configura tenant
    const enrichedData = { ...data };
    if (this.tenantField === 'tenantId') {
      (enrichedData as any).tenantId = context.tenantId;
    } else {
      (enrichedData as any).tenant = { slug: context.tenantSlug };
    }

    // Configura Auditoria
    if (this.useNestedAudit) {
      (enrichedData as any).audit = { 
        createdBy: context.actorId, 
        creationPurpose: context.lgpdPurpose,
        createdAt: new Date()
      };
    } else {
      (enrichedData as any).createdBy = context.actorId;
    }

    const createdModel = new this.model(enrichedData);
    return createdModel.save() as unknown as Promise<T>;
  }

  async updateWithContext(context: RepositoryContext, filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    this.checkAuditTrace(context, 'UPDATE');
    const safeFilter = { ...filter, ...this.getTenantFilter(context) };
    
    const enrichedUpdate = { ...update };
    if (!enrichedUpdate.$set) {
      enrichedUpdate.$set = {} as any;
    }
    
    if (this.useNestedAudit) {
      (enrichedUpdate.$set as any)['audit.lastUpdatedBy'] = context.actorId;
      (enrichedUpdate.$set as any)['audit.lastUpdatePurpose'] = context.lgpdPurpose;
      (enrichedUpdate.$set as any)['audit.lastUpdatedAt'] = new Date();
    } else {
      (enrichedUpdate.$set as any).updatedBy = context.actorId;
    }

    return this.model.findOneAndUpdate(safeFilter, enrichedUpdate as any, { new: true }).exec();
  }
}
