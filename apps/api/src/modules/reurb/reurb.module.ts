import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { ObjectStorageService } from '../shared/object-storage.service';
import { ReurbController } from './reurb.controller';
import { ReurbRepository } from './reurb.repository';
import {
  ReurbAuditLog,
  ReurbAuditLogSchema,
  ReurbDeliverable,
  ReurbDeliverableSchema,
  ReurbDocumentPendency,
  ReurbDocumentPendencySchema,
  ReurbFamily,
  ReurbFamilySchema,
  ReurbProject,
  ReurbProjectSchema,
  ReurbUnit,
  ReurbUnitSchema,
  ReurbNotification,
  ReurbNotificationSchema,
  ReurbNotificationTemplate,
  ReurbNotificationTemplateSchema,
  TenantConfig,
  TenantConfigSchema,
} from './reurb.schema';
import { ReurbService } from './reurb.service';
import { ReurbValidationService } from './reurb-validation.service';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: TenantConfig.name, schema: TenantConfigSchema },
      { name: ReurbFamily.name, schema: ReurbFamilySchema },
      { name: ReurbProject.name, schema: ReurbProjectSchema },
      { name: ReurbUnit.name, schema: ReurbUnitSchema },
      { name: ReurbNotificationTemplate.name, schema: ReurbNotificationTemplateSchema },
      { name: ReurbNotification.name, schema: ReurbNotificationSchema },
      { name: ReurbDocumentPendency.name, schema: ReurbDocumentPendencySchema },
      { name: ReurbDeliverable.name, schema: ReurbDeliverableSchema },
      { name: ReurbAuditLog.name, schema: ReurbAuditLogSchema },
    ]),
  ],
  controllers: [ReurbController],
  providers: [ReurbRepository, ReurbValidationService, ReurbService, ObjectStorageService],
  exports: [ReurbService],
})
export class ReurbModule {}
