import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    example: 'Thao tác thành công',
    description: 'Thông điệp phản hồi từ hệ thống',
  })
  message: string;
}
