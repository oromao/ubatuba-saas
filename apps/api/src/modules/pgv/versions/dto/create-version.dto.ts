import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  year!: number;
}
