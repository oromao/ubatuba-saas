"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtmModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const parcels_controller_1 = require("./parcels/parcels.controller");
const project_parcels_controller_1 = require("./parcels/project-parcels.controller");
const parcels_service_1 = require("./parcels/parcels.service");
const parcels_repository_1 = require("./parcels/parcels.repository");
const parcel_schema_1 = require("./parcels/parcel.schema");
const parcel_audit_schema_1 = require("./parcels/parcel-audit.schema");
const logradouro_schema_1 = require("./logradouros/logradouro.schema");
const logradouros_repository_1 = require("./logradouros/logradouros.repository");
const logradouros_service_1 = require("./logradouros/logradouros.service");
const logradouros_controller_1 = require("./logradouros/logradouros.controller");
const parcel_building_schema_1 = require("./parcel-buildings/parcel-building.schema");
const parcel_buildings_repository_1 = require("./parcel-buildings/parcel-buildings.repository");
const parcel_buildings_service_1 = require("./parcel-buildings/parcel-buildings.service");
const parcel_socioeconomic_schema_1 = require("./parcel-socioeconomic/parcel-socioeconomic.schema");
const parcel_socioeconomic_repository_1 = require("./parcel-socioeconomic/parcel-socioeconomic.repository");
const parcel_socioeconomic_service_1 = require("./parcel-socioeconomic/parcel-socioeconomic.service");
const parcel_infrastructure_schema_1 = require("./parcel-infrastructure/parcel-infrastructure.schema");
const parcel_infrastructure_repository_1 = require("./parcel-infrastructure/parcel-infrastructure.repository");
const parcel_infrastructure_service_1 = require("./parcel-infrastructure/parcel-infrastructure.service");
const urban_furniture_schema_1 = require("./urban-furniture/urban-furniture.schema");
const urban_furniture_repository_1 = require("./urban-furniture/urban-furniture.repository");
const urban_furniture_service_1 = require("./urban-furniture/urban-furniture.service");
const urban_furniture_controller_1 = require("./urban-furniture/urban-furniture.controller");
const projects_module_1 = require("../projects/projects.module");
const parcel_audit_repository_1 = require("./parcels/parcel-audit.repository");
let CtmModule = class CtmModule {
};
exports.CtmModule = CtmModule;
exports.CtmModule = CtmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: parcel_schema_1.Parcel.name, schema: parcel_schema_1.ParcelSchema },
                { name: parcel_audit_schema_1.ParcelAuditLog.name, schema: parcel_audit_schema_1.ParcelAuditLogSchema },
                { name: logradouro_schema_1.Logradouro.name, schema: logradouro_schema_1.LogradouroSchema },
                { name: parcel_building_schema_1.ParcelBuilding.name, schema: parcel_building_schema_1.ParcelBuildingSchema },
                { name: parcel_socioeconomic_schema_1.ParcelSocioeconomic.name, schema: parcel_socioeconomic_schema_1.ParcelSocioeconomicSchema },
                { name: parcel_infrastructure_schema_1.ParcelInfrastructure.name, schema: parcel_infrastructure_schema_1.ParcelInfrastructureSchema },
                { name: urban_furniture_schema_1.UrbanFurniture.name, schema: urban_furniture_schema_1.UrbanFurnitureSchema },
            ]),
        ],
        controllers: [
            parcels_controller_1.ParcelsController,
            project_parcels_controller_1.ProjectParcelsController,
            logradouros_controller_1.LogradourosController,
            urban_furniture_controller_1.UrbanFurnitureController,
        ],
        providers: [
            parcels_repository_1.ParcelsRepository,
            parcels_service_1.ParcelsService,
            logradouros_repository_1.LogradourosRepository,
            logradouros_service_1.LogradourosService,
            parcel_buildings_repository_1.ParcelBuildingsRepository,
            parcel_buildings_service_1.ParcelBuildingsService,
            parcel_socioeconomic_repository_1.ParcelSocioeconomicRepository,
            parcel_socioeconomic_service_1.ParcelSocioeconomicService,
            parcel_infrastructure_repository_1.ParcelInfrastructureRepository,
            parcel_infrastructure_service_1.ParcelInfrastructureService,
            urban_furniture_repository_1.UrbanFurnitureRepository,
            urban_furniture_service_1.UrbanFurnitureService,
            parcel_audit_repository_1.ParcelAuditRepository,
        ],
        exports: [
            parcels_repository_1.ParcelsRepository,
            parcel_buildings_repository_1.ParcelBuildingsRepository,
            parcel_socioeconomic_repository_1.ParcelSocioeconomicRepository,
            parcel_infrastructure_repository_1.ParcelInfrastructureRepository,
            parcels_service_1.ParcelsService,
        ],
    })
], CtmModule);
//# sourceMappingURL=ctm.module.js.map