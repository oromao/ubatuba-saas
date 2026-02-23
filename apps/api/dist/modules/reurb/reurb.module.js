"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReurbModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const object_storage_service_1 = require("../shared/object-storage.service");
const reurb_controller_1 = require("./reurb.controller");
const reurb_repository_1 = require("./reurb.repository");
const reurb_schema_1 = require("./reurb.schema");
const reurb_service_1 = require("./reurb.service");
const reurb_validation_service_1 = require("./reurb-validation.service");
let ReurbModule = class ReurbModule {
};
exports.ReurbModule = ReurbModule;
exports.ReurbModule = ReurbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: reurb_schema_1.TenantConfig.name, schema: reurb_schema_1.TenantConfigSchema },
                { name: reurb_schema_1.ReurbFamily.name, schema: reurb_schema_1.ReurbFamilySchema },
                { name: reurb_schema_1.ReurbDocumentPendency.name, schema: reurb_schema_1.ReurbDocumentPendencySchema },
                { name: reurb_schema_1.ReurbDeliverable.name, schema: reurb_schema_1.ReurbDeliverableSchema },
                { name: reurb_schema_1.ReurbAuditLog.name, schema: reurb_schema_1.ReurbAuditLogSchema },
            ]),
        ],
        controllers: [reurb_controller_1.ReurbController],
        providers: [reurb_repository_1.ReurbRepository, reurb_validation_service_1.ReurbValidationService, reurb_service_1.ReurbService, object_storage_service_1.ObjectStorageService],
        exports: [reurb_service_1.ReurbService],
    })
], ReurbModule);
//# sourceMappingURL=reurb.module.js.map