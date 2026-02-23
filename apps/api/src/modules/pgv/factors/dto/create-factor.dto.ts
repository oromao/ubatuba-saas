import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFactorDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsIn(['LAND', 'CONSTRUCTION'])
  category!: 'LAND' | 'CONSTRUCTION';

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  value!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
