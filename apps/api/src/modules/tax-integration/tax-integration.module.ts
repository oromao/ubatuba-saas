import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { TaxConnector, TaxConnectorSchema } from './tax-connector.schema';
import { TaxIntegrationController } from './tax-integration.controller';
import { TaxIntegrationRepository } from './tax-integration.repository';
import { TaxIntegrationService } from './tax-integration.service';
import { TaxSyncLog, TaxSyncLogSchema } from './tax-sync-log.schema';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: TaxConnector.name, schema: TaxConnectorSchema },
      { name: TaxSyncLog.name, schema: TaxSyncLogSchema },
    ]),
  ],
  controllers: [TaxIntegrationController],
  providers: [TaxIntegrationRepository, TaxIntegrationService],
})
export class TaxIntegrationModule {}

