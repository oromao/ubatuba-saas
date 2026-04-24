import { Allow, IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MobileChecklistDto {
  @IsOptional()
  @Allow()
  occupancyChecked?: boolean;

  @IsOptional()
  @Allow()
  addressChecked?: boolean;

  @IsOptional()
  @Allow()
  infrastructureChecked?: boolean;

  @IsOptional()
  @IsString()
  @Allow()
  notes?: string;
}

class MobileLocationDto {
  @IsNumber()
  @Allow()
  lat!: number;

  @IsNumber()
  @Allow()
  lng!: number;
}

class MobileSyncItemDto {
  @IsOptional()
  @IsString()
  @Allow()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  @Allow()
  parcelId!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MobileChecklistDto)
  @Allow()
  checklist?: MobileChecklistDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MobileLocationDto)
  @Allow()
  location?: MobileLocationDto;

  @IsOptional()
  @IsString()
  @Allow()
  photoBase64?: string;

  @IsOptional()
  @IsString()
  @Allow()
  parcelUpdatedAt?: string;

  @IsOptional()
  @Allow()
  evidences?: Array<{
    clientId: string;
    fileName?: string;
    mimeType?: string;
    base64: string;
    checksum?: string;
    capturedAt?: string;
    size?: number;
    status?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
    retries?: number;
    lastError?: string;
    lastAttemptAt?: string;
  }>;
}

export class MobileSyncDto {
  @IsOptional()
  @IsString()
  @Allow()
  projectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MobileSyncItemDto)
  @Allow()
  items!: MobileSyncItemDto[];
}
