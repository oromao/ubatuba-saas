import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @MinLength(3)
  type!: string;

  @IsString()
  @MinLength(3)
  subjectName!: string;

  @IsString()
  @IsOptional()
  subjectDocument?: string;

  @IsString()
  @IsOptional()
  processId?: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;
}
