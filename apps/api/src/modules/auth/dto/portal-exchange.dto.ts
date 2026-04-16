import { IsNotEmpty, IsString } from 'class-validator';

export class PortalExchangeDto {
  @IsString()
  @IsNotEmpty()
  signedToken!: string;
}
