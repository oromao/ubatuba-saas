"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationHubModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const projects_module_1 = require("../projects/projects.module");
const cache_service_1 = require("../shared/cache.service");
const integration_hub_controller_1 = require("./integration-hub.controller");
const integration_hub_service_1 = require("./integration-hub.service");
let IntegrationHubModule = class IntegrationHubModule {
};
exports.IntegrationHubModule = IntegrationHubModule;
exports.IntegrationHubModule = IntegrationHubModule = __decorate([
    (0, common_1.Module)({
        imports: [projects_module_1.ProjectsModule, auth_module_1.AuthModule],
        controllers: [integration_hub_controller_1.IntegrationHubController],
        providers: [integration_hub_service_1.IntegrationHubService, cache_service_1.CacheService],
    })
], IntegrationHubModule);
//# sourceMappingURL=integration-hub.module.js.map