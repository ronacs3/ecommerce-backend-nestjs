import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'Mã trạng thái HTTP' })
  statusCode: number;

  @ApiProperty({
    example: 'Dữ liệu đầu vào không hợp lệ',
    description: 'Nội dung chi tiết lỗi hoặc danh sách lỗi validation',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'Tên lỗi HTTP tương ứng' })
  error: string;
}
