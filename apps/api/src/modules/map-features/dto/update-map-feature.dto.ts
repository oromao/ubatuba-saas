import { IsObject, IsOptional } from 'class-validator';
import { PolygonGeometry } from '../../../common/utils/geo';

export class UpdateMapFeatureDto {
  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  geometry?: PolygonGeometry;
}
