"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveysModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const layer_schema_1 = require("../layers/layer.schema");
const projects_module_1 = require("../projects/projects.module");
const geoserver_publisher_service_1 = require("../shared/geoserver-publisher.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const survey_schema_1 = require("./survey.schema");
const surveys_controller_1 = require("./surveys.controller");
const surveys_repository_1 = require("./surveys.repository");
const surveys_service_1 = require("./surveys.service");
let SurveysModule = class SurveysModule {
};
exports.SurveysModule = SurveysModule;
exports.SurveysModule = SurveysModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: survey_schema_1.Survey.name, schema: survey_schema_1.SurveySchema },
                { name: layer_schema_1.Layer.name, schema: layer_schema_1.LayerSchema },
            ]),
        ],
        controllers: [surveys_controller_1.SurveysController],
        providers: [surveys_repository_1.SurveysRepository, surveys_service_1.SurveysService, object_storage_service_1.ObjectStorageService, geoserver_publisher_service_1.GeoserverPublisherService],
    })
], SurveysModule);
//# sourceMappingURL=surveys.module.js.map