"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapFeaturesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const map_features_controller_1 = require("./map-features.controller");
const map_features_service_1 = require("./map-features.service");
const map_features_repository_1 = require("./map-features.repository");
const map_feature_schema_1 = require("./map-feature.schema");
const projects_module_1 = require("../projects/projects.module");
const tenants_module_1 = require("../tenants/tenants.module");
let MapFeaturesModule = class MapFeaturesModule {
};
exports.MapFeaturesModule = MapFeaturesModule;
exports.MapFeaturesModule = MapFeaturesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: map_feature_schema_1.MapFeature.name, schema: map_feature_schema_1.MapFeatureSchema }]),
            projects_module_1.ProjectsModule,
            tenants_module_1.TenantsModule,
        ],
        controllers: [map_features_controller_1.MapFeaturesController],
        providers: [map_features_service_1.MapFeaturesService, map_features_repository_1.MapFeaturesRepository],
    })
], MapFeaturesModule);
//# sourceMappingURL=map-features.module.js.map