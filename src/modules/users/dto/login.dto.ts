import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Địa chỉ email đăng nhập của người dùng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mật khẩu tài khoản (tối đa 128 ký tự)',
    maxLength: 128,
  })
  @IsString()
  @MaxLength(128)
  password: string;
}
