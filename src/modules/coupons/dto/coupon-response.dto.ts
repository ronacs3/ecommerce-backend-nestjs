import { ApiProperty } from '@nestjs/swagger';

export class CouponResponseDto {
  @ApiProperty({
    example: 'e2912efc-1b77-4977-b9fa-9481b4f4c21e',
    description: 'UUID của mã giảm giá',
  })
  _id: string;

  @ApiProperty({
    example: 'SUMMER2026',
    description: 'Mã giảm giá',
  })
  code: string;

  @ApiProperty({
    example: 15,
    description: 'Phần trăm giảm giá',
  })
  discount: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Thời điểm hết hạn của mã giảm giá',
  })
  expirationDate: Date;

  @ApiProperty({
    example: ['Điện thoại', 'Laptop'],
    description: 'Danh sách các danh mục được áp dụng (mảng rỗng là áp dụng tất cả)',
    type: [String],
  })
  applicableCategories: string[];

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm tạo mã giảm giá',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm cập nhật mã giảm giá gần nhất',
  })
  updatedAt: Date;
}
