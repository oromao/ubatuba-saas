import { IsOptional, IsString } from 'class-validator';

export class RecalculateBatchDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  versao?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  faceId?: string;
}
