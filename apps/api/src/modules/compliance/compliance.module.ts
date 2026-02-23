import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { ComplianceController } from './compliance.controller';
import { ComplianceRepository } from './compliance.repository';
import { ComplianceProfile, ComplianceProfileSchema } from './compliance.schema';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([{ name: ComplianceProfile.name, schema: ComplianceProfileSchema }]),
  ],
  controllers: [ComplianceController],
  providers: [ComplianceRepository, ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}

