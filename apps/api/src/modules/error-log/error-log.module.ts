import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLog, ErrorLogSchema } from '../../common/schemas/error-log.schema';
import { ErrorLogService } from '../../common/services/error-log.service';
import { ErrorLogController } from './error-log.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ErrorLog.name, schema: ErrorLogSchema }]),
  ],
  controllers: [ErrorLogController],
  providers: [ErrorLogService],
  exports: [ErrorLogService],
})
export class ErrorLogModule {}
