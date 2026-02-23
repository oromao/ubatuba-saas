import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SurveyPipelineStatus, SurveyType } from '../survey.schema';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name!: string;

  @IsIn(['AEROFOTO_RGB_5CM', 'MOBILE_LIDAR_360'])
  type!: SurveyType;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  municipality!: string;

  @IsString()
  @IsNotEmpty()
  surveyDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gsdCm?: number;

  @IsString()
  @IsNotEmpty()
  srcDatum!: string;

  @IsOptional()
  @IsString()
  precision?: string;

  @IsString()
  @IsNotEmpty()
  supplier!: string;

  @IsOptional()
  @IsString()
  technicalResponsibleId?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  bbox?: [number, number, number, number];

  @IsOptional()
  @IsObject()
  areaGeometry?: Record<string, unknown>;
}

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['RECEBIDO', 'VALIDANDO', 'PUBLICADO', 'REPROVADO'])
  pipelineStatus?: SurveyPipelineStatus;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsString()
  surveyDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gsdCm?: number;

  @IsOptional()
  @IsString()
  srcDatum?: string;

  @IsOptional()
  @IsString()
  precision?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  technicalResponsibleId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class RequestSurveyUploadDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsString()
  @IsNotEmpty()
  category!: string;
}

export class CompleteSurveyUploadDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}

export class UpdateSurveyQaDto {
  @IsOptional()
  @IsBoolean()
  coverageOk?: boolean;

  @IsOptional()
  @IsBoolean()
  georeferencingOk?: boolean;

  @IsOptional()
  @IsBoolean()
  qualityOk?: boolean;

  @IsOptional()
  @IsString()
  comments?: string;
}

