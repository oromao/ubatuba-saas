import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVersionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
