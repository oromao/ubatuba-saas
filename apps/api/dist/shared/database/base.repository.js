"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
class BaseRepository {
    constructor(model, config) {
        this.model = model;
        this.logger = new common_1.Logger(this.constructor.name);
        this.tenantField = config?.tenantField ?? 'tenant.slug';
        this.useNestedAudit = config?.useNestedAudit ?? true;
    }
    checkAuditTrace(context, action) {
        if (!context.lgpdPurpose) {
            this.logger.warn(`[AUDIT_ALERT] Operacao '${action}' no model '${this.model.modelName}' ocorreu sem especificacao do 'x-lgpd-purpose' (Quebra de rastreabilidade REURB-S).`);
        }
    }
    getTenantFilter(context) {
        const value = this.tenantField === 'tenantId' ? context.tenantId : context.tenantSlug;
        if (!value)
            throw new Error(`Missing tenant identifier for ${this.tenantField}`);
        return { [this.tenantField]: value };
    }
    async findWithContext(context, filter = {}) {
        this.checkAuditTrace(context, 'FIND_MANY');
        const safeFilter = { ...filter, ...this.getTenantFilter(context) };
        return this.model.find(safeFilter).exec();
    }
    async findOneWithContext(context, filter) {
        this.checkAuditTrace(context, 'FIND_ONE');
        const safeFilter = { ...filter, ...this.getTenantFilter(context) };
        return this.model.findOne(safeFilter).exec();
    }
    async createWithContext(context, data) {
        this.checkAuditTrace(context, 'CREATE');
        const enrichedData = { ...data };
        if (this.tenantField === 'tenantId') {
            enrichedData.tenantId = context.tenantId;
        }
        else {
            enrichedData.tenant = { slug: context.tenantSlug };
        }
        if (this.useNestedAudit) {
            enrichedData.audit = {
                createdBy: context.actorId,
                creationPurpose: context.lgpdPurpose,
                createdAt: new Date()
            };
        }
        else {
            enrichedData.createdBy = context.actorId;
        }
        const createdModel = new this.model(enrichedData);
        return createdModel.save();
    }
    async updateWithContext(context, filter, update) {
        this.checkAuditTrace(context, 'UPDATE');
        const safeFilter = { ...filter, ...this.getTenantFilter(context) };
        const enrichedUpdate = { ...update };
        if (!enrichedUpdate.$set) {
            enrichedUpdate.$set = {};
        }
        if (this.useNestedAudit) {
            enrichedUpdate.$set['audit.lastUpdatedBy'] = context.actorId;
            enrichedUpdate.$set['audit.lastUpdatePurpose'] = context.lgpdPurpose;
            enrichedUpdate.$set['audit.lastUpdatedAt'] = new Date();
        }
        else {
            enrichedUpdate.$set.updatedBy = context.actorId;
        }
        return this.model.findOneAndUpdate(safeFilter, enrichedUpdate, { new: true }).exec();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map