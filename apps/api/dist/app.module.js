"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const users_module_1 = require("./modules/users/users.module");
const memberships_module_1 = require("./modules/memberships/memberships.module");
const processes_module_1 = require("./modules/processes/processes.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const assets_module_1 = require("./modules/assets/assets.module");
const health_module_1 = require("./modules/health/health.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const tenant_guard_1 = require("./common/guards/tenant.guard");
const jwt_guard_1 = require("./modules/auth/guards/jwt.guard");
const logger_module_1 = require("./common/logger/logger.module");
const layers_module_1 = require("./modules/layers/layers.module");
const areas_module_1 = require("./modules/areas/areas.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const roles_guard_1 = require("./common/guards/roles.guard");
const projects_module_1 = require("./modules/projects/projects.module");
const ctm_module_1 = require("./modules/ctm/ctm.module");
const pgv_module_1 = require("./modules/pgv/pgv.module");
const osm_module_1 = require("./modules/osm/osm.module");
const map_features_module_1 = require("./modules/map-features/map-features.module");
const metrics_module_1 = require("./modules/metrics/metrics.module");
const compliance_module_1 = require("./modules/compliance/compliance.module");
const tax_integration_module_1 = require("./modules/tax-integration/tax-integration.module");
const notifications_letters_module_1 = require("./modules/notifications-letters/notifications-letters.module");
const surveys_module_1 = require("./modules/surveys/surveys.module");
const mobile_module_1 = require("./modules/mobile/mobile.module");
const poc_module_1 = require("./modules/poc/poc.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            logger_module_1.LoggerModule,
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URL ?? '', {
                autoIndex: false,
            }),
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            memberships_module_1.MembershipsModule,
            processes_module_1.ProcessesModule,
            alerts_module_1.AlertsModule,
            assets_module_1.AssetsModule,
            dashboard_module_1.DashboardModule,
            health_module_1.HealthModule,
            layers_module_1.LayersModule,
            areas_module_1.AreasModule,
            uploads_module_1.UploadsModule,
            projects_module_1.ProjectsModule,
            ctm_module_1.CtmModule,
            pgv_module_1.PgvModule,
            osm_module_1.OsmModule,
            map_features_module_1.MapFeaturesModule,
            metrics_module_1.MetricsModule,
            compliance_module_1.ComplianceModule,
            tax_integration_module_1.TaxIntegrationModule,
            notifications_letters_module_1.NotificationsLettersModule,
            surveys_module_1.SurveysModule,
            mobile_module_1.MobileModule,
            poc_module_1.PocModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map