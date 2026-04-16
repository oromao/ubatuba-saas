import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardLayout, DashboardLayoutSchema } from './dashboard-layout.schema';
import { ProcessesModule } from '../processes/processes.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AssetsModule } from '../assets/assets.module';
import { PermitsWorksModule } from '../permits-works/permits-works.module';
import { PermitsBusinessModule } from '../permits-business/permits-business.module';
import { Citizen156Module } from '../citizen-156/citizen-156.module';
import { EnvironmentModule } from '../environment/environment.module';
import { PublicWorksModule } from '../public-works/public-works.module';
import { CemeteryModule } from '../cemetery/cemetery.module';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { CtmModule } from '../ctm/ctm.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DashboardLayout.name, schema: DashboardLayoutSchema }]),
    ProcessesModule,
    AlertsModule,
    AssetsModule,
    PermitsWorksModule,
    PermitsBusinessModule,
    Citizen156Module,
    EnvironmentModule,
    PublicWorksModule,
    CemeteryModule,
    CtmModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, CacheService, RedisService],
})
export class DashboardModule {}
