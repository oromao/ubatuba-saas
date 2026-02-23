"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxIntegrationRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const tax_connector_schema_1 = require("./tax-connector.schema");
const tax_sync_log_schema_1 = require("./tax-sync-log.schema");
let TaxIntegrationRepository = class TaxIntegrationRepository {
    constructor(connectorModel, logModel) {
        this.connectorModel = connectorModel;
        this.logModel = logModel;
    }
    listConnectors(tenantId, projectId) {
        return this.connectorModel
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    findConnectorById(tenantId, projectId, connectorId) {
        return this.connectorModel
            .findOne({
            _id: connectorId,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        })
            .exec();
    }
    createConnector(data) {
        return this.connectorModel.create(data);
    }
    updateConnector(tenantId, projectId, connectorId, data) {
        return this.connectorModel
            .findOneAndUpdate({ _id: connectorId, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, data, { new: true })
            .exec();
    }
    createLog(data) {
        return this.logModel.create(data);
    }
    listLogs(tenantId, projectId, connectorId) {
        return this.logModel
            .find({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            connectorId: (0, object_id_1.asObjectId)(connectorId),
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .exec();
    }
};
exports.TaxIntegrationRepository = TaxIntegrationRepository;
exports.TaxIntegrationRepository = TaxIntegrationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tax_connector_schema_1.TaxConnector.name)),
    __param(1, (0, mongoose_1.InjectModel)(tax_sync_log_schema_1.TaxSyncLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TaxIntegrationRepository);
//# sourceMappingURL=tax-integration.repository.js.map