import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LgpdAudit, LgpdAuditSchema } from '../../common/schemas/lgpd-audit.schema';
import { LgpdAuditService } from '../../common/services/lgpd-audit.service';
import { LgpdController } from './lgpd.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LgpdAudit.name, schema: LgpdAuditSchema }]),
  ],
  controllers: [LgpdController],
  providers: [LgpdAuditService],
  exports: [LgpdAuditService],
})
export class LgpdModule {}
