import { IsNotEmpty, IsString } from 'class-validator';

export class TransitionDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
