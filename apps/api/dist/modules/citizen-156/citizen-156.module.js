"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Citizen156Module = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const alerts_module_1 = require("../alerts/alerts.module");
const projects_module_1 = require("../projects/projects.module");
const tenants_module_1 = require("../tenants/tenants.module");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const citizen_156_controller_1 = require("./citizen-156.controller");
const citizen_156_repository_1 = require("./citizen-156.repository");
const citizen_156_service_1 = require("./citizen-156.service");
const citizen_call_schema_1 = require("./citizen-call.schema");
const public_calls_controller_1 = require("./public-calls.controller");
let Citizen156Module = class Citizen156Module {
};
exports.Citizen156Module = Citizen156Module;
exports.Citizen156Module = Citizen156Module = __decorate([
    (0, common_1.Module)({
        imports: [
            alerts_module_1.AlertsModule,
            projects_module_1.ProjectsModule,
            tenants_module_1.TenantsModule,
            mongoose_1.MongooseModule.forFeature([{ name: citizen_call_schema_1.CitizenCall.name, schema: citizen_call_schema_1.CitizenCallSchema }]),
        ],
        controllers: [citizen_156_controller_1.Citizen156Controller, public_calls_controller_1.PublicCallsController],
        providers: [citizen_156_repository_1.Citizen156Repository, citizen_156_service_1.Citizen156Service, cache_service_1.CacheService, redis_service_1.RedisService],
        exports: [citizen_156_service_1.Citizen156Service],
    })
], Citizen156Module);
//# sourceMappingURL=citizen-156.module.js.map