import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddMeasurementDto {
  @IsString()
  label!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  message?: string;
}
