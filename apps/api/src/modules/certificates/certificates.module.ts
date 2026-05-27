import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Process, ProcessSchema } from '../processes/process.schema';
import { ProcessesModule } from '../processes/processes.module';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { RedisService } from '../shared/redis.service';
import { DigitalSignatureService } from '../../common/services/digital-signature.service';
import { GovBrSignatureService } from '../../common/services/govbr-signature.service';
import { Certificate, CertificateSchema } from './certificate.schema';
import { CertificatesController } from './certificates.controller';
import { CertificatesRepository } from './certificates.repository';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [
    ProcessesModule,
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: Process.name, schema: ProcessSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesRepository, CertificatesService, DigitalSignatureService, GovBrSignatureService, CacheService, RedisService, ObjectStorageService],
  exports: [CertificatesService, GovBrSignatureService],
})
export class CertificatesModule {}
