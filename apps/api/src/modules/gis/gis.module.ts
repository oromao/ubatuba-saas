import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GisService } from './gis.service';
import { GisController } from './gis.controller';
import { Parcel, ParcelSchema } from '../ctm/parcels/parcel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
    ]),
  ],
  controllers: [GisController],
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
