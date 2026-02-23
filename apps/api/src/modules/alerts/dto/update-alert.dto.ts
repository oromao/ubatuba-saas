import { IsOptional, IsString } from 'class-validator';

export class UpdateAlertDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
