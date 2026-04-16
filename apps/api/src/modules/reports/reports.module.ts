import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Parcel, ParcelSchema } from '../ctm/parcels/parcel.schema';
import { Vistoria, VistoriaSchema } from '../ctm/vistoria.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Vistoria.name, schema: VistoriaSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
