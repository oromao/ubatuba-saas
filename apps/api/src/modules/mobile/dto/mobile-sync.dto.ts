import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MobileChecklistDto {
  @IsOptional()
  occupancyChecked?: boolean;

  @IsOptional()
  addressChecked?: boolean;

  @IsOptional()
  infrastructureChecked?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class MobileLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

class MobileSyncItemDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  parcelId!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MobileChecklistDto)
  checklist?: MobileChecklistDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MobileLocationDto)
  location?: MobileLocationDto;

  @IsOptional()
  @IsString()
  photoBase64?: string;

  @IsOptional()
  @IsString()
  parcelUpdatedAt?: string;

  @IsOptional()
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
  projectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MobileSyncItemDto)
  items!: MobileSyncItemDto[];
}
