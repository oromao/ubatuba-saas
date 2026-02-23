"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const layers_controller_1 = require("./layers.controller");
const layer_schema_1 = require("./layer.schema");
const layers_repository_1 = require("./layers.repository");
const layers_service_1 = require("./layers.service");
let LayersModule = class LayersModule {
};
exports.LayersModule = LayersModule;
exports.LayersModule = LayersModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: layer_schema_1.Layer.name, schema: layer_schema_1.LayerSchema }])],
        controllers: [layers_controller_1.LayersController],
        providers: [layers_service_1.LayersService, layers_repository_1.LayersRepository, cache_service_1.CacheService, redis_service_1.RedisService],
    })
], LayersModule);
//# sourceMappingURL=layers.module.js.map