import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên người dùng (từ 2 đến 100 ký tự)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mật khẩu tài khoản (tối thiểu 8 ký tự, tối đa 128 ký tự)',
    minLength: 8,
    maxLength: 128,
  })
  @MinLength(8)
  declare password: string;
}
