import { IsString, MinLength, MaxLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @MinLength(8)
  declare password: string;
}
