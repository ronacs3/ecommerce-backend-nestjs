import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email cần nhận liên kết đặt lại mật khẩu',
  })
  @IsEmail()
  email: string;
}
