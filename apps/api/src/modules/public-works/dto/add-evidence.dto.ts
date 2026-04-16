import { IsArray, IsOptional, IsString } from 'class-validator';

export class AddEvidenceDto {
  @IsArray()
  @IsString({ each: true })
  keys!: string[];

  @IsOptional()
  @IsString()
  message?: string;
}
