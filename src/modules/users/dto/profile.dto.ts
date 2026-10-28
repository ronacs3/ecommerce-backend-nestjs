import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Văn B',
    description: 'Họ và tên mới (từ 2 đến 100 ký tự)',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Địa chỉ email mới (phải chưa tồn tại trên hệ thống)',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description: 'Mật khẩu mới (tối thiểu 8 ký tự, tối đa 128 ký tự)',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;
}
