"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgvModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const zone_schema_1 = require("./zones/zone.schema");
const face_schema_1 = require("./faces/face.schema");
const factor_schema_1 = require("./factors/factor.schema");
const factor_set_schema_1 = require("./factor-sets/factor-set.schema");
const version_schema_1 = require("./versions/version.schema");
const valuation_schema_1 = require("./valuations/valuation.schema");
const assessment_schema_1 = require("./assessments/assessment.schema");
const zones_repository_1 = require("./zones/zones.repository");
const zones_service_1 = require("./zones/zones.service");
const zones_controller_1 = require("./zones/zones.controller");
const faces_repository_1 = require("./faces/faces.repository");
const faces_service_1 = require("./faces/faces.service");
const faces_controller_1 = require("./faces/faces.controller");
const factors_repository_1 = require("./factors/factors.repository");
const factors_service_1 = require("./factors/factors.service");
const factors_controller_1 = require("./factors/factors.controller");
const factor_sets_repository_1 = require("./factor-sets/factor-sets.repository");
const factor_sets_service_1 = require("./factor-sets/factor-sets.service");
const factor_sets_controller_1 = require("./factor-sets/factor-sets.controller");
const versions_repository_1 = require("./versions/versions.repository");
const versions_service_1 = require("./versions/versions.service");
const versions_controller_1 = require("./versions/versions.controller");
const valuations_repository_1 = require("./valuations/valuations.repository");
const valuations_service_1 = require("./valuations/valuations.service");
const valuations_controller_1 = require("./valuations/valuations.controller");
const assessments_repository_1 = require("./assessments/assessments.repository");
const pgv_controller_1 = require("./pgv.controller");
const projects_module_1 = require("../projects/projects.module");
const ctm_module_1 = require("../ctm/ctm.module");
let PgvModule = class PgvModule {
};
exports.PgvModule = PgvModule;
exports.PgvModule = PgvModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            ctm_module_1.CtmModule,
            mongoose_1.MongooseModule.forFeature([
                { name: zone_schema_1.PgvZone.name, schema: zone_schema_1.PgvZoneSchema },
                { name: face_schema_1.PgvFace.name, schema: face_schema_1.PgvFaceSchema },
                { name: factor_schema_1.PgvFactor.name, schema: factor_schema_1.PgvFactorSchema },
                { name: factor_set_schema_1.PgvFactorSet.name, schema: factor_set_schema_1.PgvFactorSetSchema },
                { name: version_schema_1.PgvVersion.name, schema: version_schema_1.PgvVersionSchema },
                { name: valuation_schema_1.PgvValuation.name, schema: valuation_schema_1.PgvValuationSchema },
                { name: assessment_schema_1.PgvAssessment.name, schema: assessment_schema_1.PgvAssessmentSchema },
            ]),
        ],
        controllers: [
            zones_controller_1.ZonesController,
            faces_controller_1.FacesController,
            factors_controller_1.FactorsController,
            factor_sets_controller_1.FactorSetsController,
            versions_controller_1.VersionsController,
            valuations_controller_1.ValuationsController,
            pgv_controller_1.PgvController,
        ],
        providers: [
            zones_repository_1.ZonesRepository,
            zones_service_1.ZonesService,
            faces_repository_1.FacesRepository,
            faces_service_1.FacesService,
            factors_repository_1.FactorsRepository,
            factors_service_1.FactorsService,
            factor_sets_repository_1.FactorSetsRepository,
            factor_sets_service_1.FactorSetsService,
            versions_repository_1.VersionsRepository,
            versions_service_1.VersionsService,
            valuations_repository_1.ValuationsRepository,
            valuations_service_1.ValuationsService,
            assessments_repository_1.AssessmentsRepository,
        ],
    })
], PgvModule);
//# sourceMappingURL=pgv.module.js.map