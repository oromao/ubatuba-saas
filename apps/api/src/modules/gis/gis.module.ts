import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParcelsRepository } from '../ctm/parcels/parcels.repository';
import { Parcel, ParcelSchema } from '../ctm/parcels/parcel.schema';
import { GisController } from './gis.controller';
import { GisService } from './gis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Parcel.name, schema: ParcelSchema }]),
  ],
  controllers: [GisController],
  providers: [GisService, ParcelsRepository],
  exports: [GisService],
})
export class GisModule {}
