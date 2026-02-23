import { IsOptional, IsString } from 'class-validator';

export class UpdateProcessDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  owner?: string;
}
