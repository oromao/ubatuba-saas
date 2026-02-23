"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsmModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_module_1 = require("../projects/projects.module");
const road_schema_1 = require("./roads/road.schema");
const roads_repository_1 = require("./roads/roads.repository");
const roads_service_1 = require("./roads/roads.service");
const roads_controller_1 = require("./roads/roads.controller");
const project_roads_controller_1 = require("./roads/project-roads.controller");
const building_schema_1 = require("./buildings/building.schema");
const buildings_repository_1 = require("./buildings/buildings.repository");
const buildings_service_1 = require("./buildings/buildings.service");
const buildings_controller_1 = require("./buildings/buildings.controller");
const project_buildings_controller_1 = require("./buildings/project-buildings.controller");
let OsmModule = class OsmModule {
};
exports.OsmModule = OsmModule;
exports.OsmModule = OsmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: road_schema_1.Road.name, schema: road_schema_1.RoadSchema },
                { name: building_schema_1.Building.name, schema: building_schema_1.BuildingSchema },
            ]),
        ],
        controllers: [
            roads_controller_1.RoadsController,
            project_roads_controller_1.ProjectRoadsController,
            buildings_controller_1.BuildingsController,
            project_buildings_controller_1.ProjectBuildingsController,
        ],
        providers: [roads_repository_1.RoadsRepository, roads_service_1.RoadsService, buildings_repository_1.BuildingsRepository, buildings_service_1.BuildingsService],
        exports: [roads_repository_1.RoadsRepository, buildings_repository_1.BuildingsRepository],
    })
], OsmModule);
//# sourceMappingURL=osm.module.js.map