import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateLayerDto {
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}
