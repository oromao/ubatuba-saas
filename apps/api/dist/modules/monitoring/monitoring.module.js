"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const alerts_module_1 = require("../alerts/alerts.module");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const environment_event_schema_1 = require("./environment-event.schema");
const monitoring_controller_1 = require("./monitoring.controller");
const monitoring_repository_1 = require("./monitoring.repository");
const monitoring_service_1 = require("./monitoring.service");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            alerts_module_1.AlertsModule,
            mongoose_1.MongooseModule.forFeature([{ name: environment_event_schema_1.EnvironmentalEvent.name, schema: environment_event_schema_1.EnvironmentalEventSchema }]),
        ],
        controllers: [monitoring_controller_1.MonitoringController],
        providers: [monitoring_repository_1.MonitoringRepository, monitoring_service_1.MonitoringService, cache_service_1.CacheService, redis_service_1.RedisService],
        exports: [monitoring_service_1.MonitoringService],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map