import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermitWorkDto {
  @IsString()
  @IsNotEmpty()
  applicantName!: string;

  @IsString()
  @IsNotEmpty()
  subjectAddress!: string;

  @IsOptional()
  @IsString()
  parcelId?: string;

  @IsOptional()
  @IsArray()
  requirements?: string[];
}
