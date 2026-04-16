import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCemeteryPlotDto {
  @IsString()
  cemeteryName!: string;

  @IsString()
  block!: string;

  @IsString()
  row!: string;

  @IsString()
  plot!: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  occupantName?: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentKeys?: string[];
}
