"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const asset_schema_1 = require("./asset.schema");
const assets_controller_1 = require("./assets.controller");
const assets_repository_1 = require("./assets.repository");
const assets_service_1 = require("./assets.service");
let AssetsModule = class AssetsModule {
};
exports.AssetsModule = AssetsModule;
exports.AssetsModule = AssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema }])],
        controllers: [assets_controller_1.AssetsController],
        providers: [assets_repository_1.AssetsRepository, assets_service_1.AssetsService, cache_service_1.CacheService, redis_service_1.RedisService],
        exports: [assets_service_1.AssetsService],
    })
], AssetsModule);
//# sourceMappingURL=assets.module.js.map