"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_layout_schema_1 = require("./dashboard-layout.schema");
const processes_module_1 = require("../processes/processes.module");
const alerts_module_1 = require("../alerts/alerts.module");
const assets_module_1 = require("../assets/assets.module");
const permits_works_module_1 = require("../permits-works/permits-works.module");
const permits_business_module_1 = require("../permits-business/permits-business.module");
const citizen_156_module_1 = require("../citizen-156/citizen-156.module");
const environment_module_1 = require("../environment/environment.module");
const public_works_module_1 = require("../public-works/public-works.module");
const cemetery_module_1 = require("../cemetery/cemetery.module");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: dashboard_layout_schema_1.DashboardLayout.name, schema: dashboard_layout_schema_1.DashboardLayoutSchema }]),
            processes_module_1.ProcessesModule,
            alerts_module_1.AlertsModule,
            assets_module_1.AssetsModule,
            permits_works_module_1.PermitsWorksModule,
            permits_business_module_1.PermitsBusinessModule,
            citizen_156_module_1.Citizen156Module,
            environment_module_1.EnvironmentModule,
            public_works_module_1.PublicWorksModule,
            cemetery_module_1.CemeteryModule,
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService, cache_service_1.CacheService, redis_service_1.RedisService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map