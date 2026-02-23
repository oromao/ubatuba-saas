import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFactorDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LAND', 'CONSTRUCTION'])
  category?: 'LAND' | 'CONSTRUCTION';

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
