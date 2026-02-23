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

