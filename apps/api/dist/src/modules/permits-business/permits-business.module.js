"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermitsBusinessModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const redis_service_1 = require("../shared/redis.service");
const permit_business_schema_1 = require("./permit-business.schema");
const permits_business_controller_1 = require("./permits-business.controller");
const permits_business_repository_1 = require("./permits-business.repository");
const permits_business_service_1 = require("./permits-business.service");
let PermitsBusinessModule = class PermitsBusinessModule {
};
exports.PermitsBusinessModule = PermitsBusinessModule;
exports.PermitsBusinessModule = PermitsBusinessModule = __decorate([
    (0, common_1.Module)({
        imports: [projects_module_1.ProjectsModule, mongoose_1.MongooseModule.forFeature([{ name: permit_business_schema_1.PermitBusinessRequest.name, schema: permit_business_schema_1.PermitBusinessRequestSchema }])],
        controllers: [permits_business_controller_1.PermitsBusinessController],
        providers: [permits_business_repository_1.PermitsBusinessRepository, permits_business_service_1.PermitsBusinessService, cache_service_1.CacheService, redis_service_1.RedisService, object_storage_service_1.ObjectStorageService],
        exports: [permits_business_service_1.PermitsBusinessService],
    })
], PermitsBusinessModule);
//# sourceMappingURL=permits-business.module.js.map