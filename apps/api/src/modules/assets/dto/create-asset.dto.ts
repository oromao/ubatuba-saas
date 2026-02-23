import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
