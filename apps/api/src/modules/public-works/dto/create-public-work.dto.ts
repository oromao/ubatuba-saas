import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePublicWorkDto {
  @IsString()
  title!: string;

  @IsString()
  department!: string;

  @IsString()
  location!: string;

  @IsOptional()
  @IsString()
  contractor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
