"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const lgpd_audit_schema_1 = require("../../common/schemas/lgpd-audit.schema");
const lgpd_audit_service_1 = require("../../common/services/lgpd-audit.service");
const lgpd_controller_1 = require("./lgpd.controller");
let LgpdModule = class LgpdModule {
};
exports.LgpdModule = LgpdModule;
exports.LgpdModule = LgpdModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: lgpd_audit_schema_1.LgpdAudit.name, schema: lgpd_audit_schema_1.LgpdAuditSchema }]),
        ],
        controllers: [lgpd_controller_1.LgpdController],
        providers: [lgpd_audit_service_1.LgpdAuditService],
        exports: [lgpd_audit_service_1.LgpdAuditService],
    })
], LgpdModule);
//# sourceMappingURL=lgpd.module.js.map