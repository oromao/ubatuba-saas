import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  level!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
