"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CemeteryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const cemetery_controller_1 = require("./cemetery.controller");
const cemetery_schema_1 = require("./cemetery.schema");
const cemetery_repository_1 = require("./cemetery.repository");
const cemetery_service_1 = require("./cemetery.service");
let CemeteryModule = class CemeteryModule {
};
exports.CemeteryModule = CemeteryModule;
exports.CemeteryModule = CemeteryModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: cemetery_schema_1.CemeteryPlot.name, schema: cemetery_schema_1.CemeteryPlotSchema }])],
        controllers: [cemetery_controller_1.CemeteryController],
        providers: [cemetery_repository_1.CemeteryRepository, cemetery_service_1.CemeteryService, cache_service_1.CacheService, redis_service_1.RedisService],
        exports: [cemetery_service_1.CemeteryService],
    })
], CemeteryModule);
//# sourceMappingURL=cemetery.module.js.map