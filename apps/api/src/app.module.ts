import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { GisModule } from './modules/gis/gis.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AssetsModule } from './modules/assets/assets.module';
import { HealthModule } from './modules/health/health.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TenantGuard } from './common/guards/tenant.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { LoggerModule } from './common/logger/logger.module';
import { LayersModule } from './modules/layers/layers.module';
import { AreasModule } from './modules/areas/areas.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { RolesGuard } from './common/guards/roles.guard';
import { SharedModule } from './modules/shared/shared.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CtmModule } from './modules/ctm/ctm.module';
import { PgvModule } from './modules/pgv/pgv.module';
import { OsmModule } from './modules/osm/osm.module';
import { MapFeaturesModule } from './modules/map-features/map-features.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { TaxIntegrationModule } from './modules/tax-integration/tax-integration.module';
import { NotificationsLettersModule } from './modules/notifications-letters/notifications-letters.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { PocModule } from './modules/poc/poc.module';
import { ReurbModule } from './modules/reurb/reurb.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { PermitsWorksModule } from './modules/permits-works/permits-works.module';
import { PermitsBusinessModule } from './modules/permits-business/permits-business.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { Citizen156Module } from './modules/citizen-156/citizen-156.module';
import { PublicWorksModule } from './modules/public-works/public-works.module';
import { CemeteryModule } from './modules/cemetery/cemetery.module';
import { ObservatoryModule } from './modules/observatory/observatory.module';
import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';
import { ErrorLogModule } from './modules/error-log/error-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, string | undefined>) => {
        if (!env.MONGO_URL?.trim()) {
          throw new Error('MONGO_URL obrigatorio para inicializar a API');
        }
        return env;
      },
    }),
    LoggerModule,
    SharedModule,
    MongooseModule.forRoot(process.env.MONGO_URL as string, {
      autoIndex: false,
    }),
    AuthModule,
    TenantsModule,
    UsersModule,
    GisModule,
    MembershipsModule,
    ProcessesModule,
    AlertsModule,
    AssetsModule,
    DashboardModule,
    HealthModule,
    LayersModule,
    AreasModule,
    UploadsModule,
    ProjectsModule,
    CtmModule,
    PgvModule,
    OsmModule,
    MapFeaturesModule,
    MetricsModule,
    ComplianceModule,
    TaxIntegrationModule,
    NotificationsLettersModule,
    SurveysModule,
    MobileModule,
    PocModule,
    ReurbModule,
    CertificatesModule,
    PermitsWorksModule,
    PermitsBusinessModule,
    MonitoringModule,
    EnvironmentModule,
    Citizen156Module,
    ReportsModule,
    PublicWorksModule,
    LgpdModule,
    ErrorLogModule,
    CemeteryModule,
    ObservatoryModule,
    IntegrationHubModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
