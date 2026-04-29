"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const tax_connector_schema_1 = require("./tax-connector.schema");
const tax_integration_controller_1 = require("./tax-integration.controller");
const tax_integration_repository_1 = require("./tax-integration.repository");
const tax_integration_service_1 = require("./tax-integration.service");
const tax_sync_log_schema_1 = require("./tax-sync-log.schema");
let TaxIntegrationModule = class TaxIntegrationModule {
};
exports.TaxIntegrationModule = TaxIntegrationModule;
exports.TaxIntegrationModule = TaxIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: tax_connector_schema_1.TaxConnector.name, schema: tax_connector_schema_1.TaxConnectorSchema },
                { name: tax_sync_log_schema_1.TaxSyncLog.name, schema: tax_sync_log_schema_1.TaxSyncLogSchema },
            ]),
        ],
        controllers: [tax_integration_controller_1.TaxIntegrationController],
        providers: [tax_integration_repository_1.TaxIntegrationRepository, tax_integration_service_1.TaxIntegrationService],
    })
], TaxIntegrationModule);
//# sourceMappingURL=tax-integration.module.js.map