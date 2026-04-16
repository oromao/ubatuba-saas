"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservatoryModule = void 0;
const common_1 = require("@nestjs/common");
const ctm_module_1 = require("../ctm/ctm.module");
const pgv_module_1 = require("../pgv/pgv.module");
const monitoring_module_1 = require("../monitoring/monitoring.module");
const projects_module_1 = require("../projects/projects.module");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const observatory_controller_1 = require("./observatory.controller");
const observatory_service_1 = require("./observatory.service");
let ObservatoryModule = class ObservatoryModule {
};
exports.ObservatoryModule = ObservatoryModule;
exports.ObservatoryModule = ObservatoryModule = __decorate([
    (0, common_1.Module)({
        imports: [projects_module_1.ProjectsModule, ctm_module_1.CtmModule, pgv_module_1.PgvModule, monitoring_module_1.MonitoringModule],
        controllers: [observatory_controller_1.ObservatoryController],
        providers: [observatory_service_1.ObservatoryService, cache_service_1.CacheService, redis_service_1.RedisService],
    })
], ObservatoryModule);
//# sourceMappingURL=observatory.module.js.map