import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCitizenCallDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  reporterName?: string;

  @IsOptional()
  @IsString()
  reporterContact?: string;

  @IsOptional()
  @IsString()
  processId?: string;

  @IsOptional()
  @IsString()
  alertId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentKeys?: string[];
}
