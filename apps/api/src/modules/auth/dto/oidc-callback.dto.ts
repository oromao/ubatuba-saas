import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OidcCallbackDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  state?: string;
}
