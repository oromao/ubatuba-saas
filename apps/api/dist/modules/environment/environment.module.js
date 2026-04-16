"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const redis_service_1 = require("../shared/redis.service");
const environment_case_schema_1 = require("./environment-case.schema");
const environment_controller_1 = require("./environment.controller");
const environment_repository_1 = require("./environment.repository");
const environment_service_1 = require("./environment.service");
let EnvironmentModule = class EnvironmentModule {
};
exports.EnvironmentModule = EnvironmentModule;
exports.EnvironmentModule = EnvironmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([{ name: environment_case_schema_1.EnvironmentCase.name, schema: environment_case_schema_1.EnvironmentCaseSchema }]),
        ],
        controllers: [environment_controller_1.EnvironmentController],
        providers: [environment_repository_1.EnvironmentRepository, environment_service_1.EnvironmentService, cache_service_1.CacheService, redis_service_1.RedisService, object_storage_service_1.ObjectStorageService],
        exports: [environment_service_1.EnvironmentService],
    })
], EnvironmentModule);
//# sourceMappingURL=environment.module.js.map