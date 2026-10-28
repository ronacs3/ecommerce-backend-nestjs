import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    example: 'Tư vấn cho tôi các sản phẩm điện thoại dưới 15 triệu',
    description: 'Tin nhắn hội thoại gửi tới trợ lý AI (tối đa 2000 ký tự)',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;
}
