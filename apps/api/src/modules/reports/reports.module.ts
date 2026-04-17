import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Parcel, ParcelSchema } from '../ctm/parcels/parcel.schema';
import { Vistoria, VistoriaSchema } from '../ctm/vistoria.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Vistoria.name, schema: VistoriaSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
