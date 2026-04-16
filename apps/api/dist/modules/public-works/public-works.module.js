"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicWorksModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const cache_service_1 = require("../shared/cache.service");
const public_work_schema_1 = require("./public-work.schema");
const public_works_controller_1 = require("./public-works.controller");
const public_works_repository_1 = require("./public-works.repository");
const public_works_service_1 = require("./public-works.service");
let PublicWorksModule = class PublicWorksModule {
};
exports.PublicWorksModule = PublicWorksModule;
exports.PublicWorksModule = PublicWorksModule = __decorate([
    (0, common_1.Module)({
        imports: [projects_module_1.ProjectsModule, mongoose_1.MongooseModule.forFeature([{ name: public_work_schema_1.PublicWork.name, schema: public_work_schema_1.PublicWorkSchema }])],
        controllers: [public_works_controller_1.PublicWorksController],
        providers: [public_works_repository_1.PublicWorksRepository, public_works_service_1.PublicWorksService, cache_service_1.CacheService],
        exports: [public_works_service_1.PublicWorksService],
    })
], PublicWorksModule);
//# sourceMappingURL=public-works.module.js.map