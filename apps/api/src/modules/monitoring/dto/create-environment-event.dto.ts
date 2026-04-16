import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnvironmentEventDto {
  @IsIn(['DESLIZAMENTO', 'INUNDACAO', 'QUEIMADA', 'SUPRESSAO_VEGETACAO', 'SOLO_EXPOSTO', 'PRECIPITACAO_EXTREMA', 'VENTO_FORTE', 'SENSOR_OFFLINE'])
  type!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'])
  severity!: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsIn(['MANUAL', 'SENSOR', 'SATELLITE', 'API'])
  sourceMode?: 'MANUAL' | 'SENSOR' | 'SATELLITE' | 'API';

  @IsOptional()
  @IsString()
  sourceAdapter?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsString()
  observedAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceKeys?: string[];

  @IsOptional()
  @IsString()
  classification?: string;
}
