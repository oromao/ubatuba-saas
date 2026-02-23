import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { PolygonGeometry } from '../../../common/utils/geo';
import { MapFeatureType } from '../map-feature.schema';

export class CreateMapFeatureDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsIn(['parcel', 'building'])
  featureType!: MapFeatureType;

  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @IsObject()
  geometry!: PolygonGeometry;
}
