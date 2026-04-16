import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OidcAuthorizeDto {
  @IsString()
  @IsNotEmpty()
  tenantSlug!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  roleHint?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  context?: Record<string, unknown>;
}
