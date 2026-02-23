import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  defaultCenter?: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsNumber({}, { each: true })
  @IsOptional()
  defaultBbox?: number[];

  @IsNumber()
  @IsOptional()
  defaultZoom?: number;
}
