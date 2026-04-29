"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const area_schema_1 = require("./area.schema");
const areas_controller_1 = require("./areas.controller");
const areas_repository_1 = require("./areas.repository");
const areas_service_1 = require("./areas.service");
let AreasModule = class AreasModule {
};
exports.AreasModule = AreasModule;
exports.AreasModule = AreasModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: area_schema_1.Area.name, schema: area_schema_1.AreaSchema }])],
        controllers: [areas_controller_1.AreasController],
        providers: [areas_service_1.AreasService, areas_repository_1.AreasRepository, cache_service_1.CacheService, redis_service_1.RedisService],
    })
], AreasModule);
//# sourceMappingURL=areas.module.js.map