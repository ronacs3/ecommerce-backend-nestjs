import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    example: '8df9a81e-1823-4217-a068-125917c2f6d0',
    description: 'UUID của đánh giá',
  })
  _id: string;

  @ApiProperty({
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
    description: 'UUID của người dùng viết đánh giá',
  })
  userId: string;

  @ApiProperty({
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
    description: 'ID định danh người dùng',
  })
  user: string;

  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm được đánh giá',
  })
  productId: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên người dùng đánh giá',
  })
  name: string;

  @ApiProperty({
    example: 5,
    description: 'Điểm số đánh giá từ 1 đến 5 sao',
  })
  rating: number;

  @ApiProperty({
    example: 'Sản phẩm đóng gói rất cẩn thận, dùng mượt mà và đúng như mô tả!',
    description: 'Nội dung nhận xét đánh giá',
  })
  comment: string;

  @ApiProperty({
    example: '2026-02-01T10:00:00.000Z',
    description: 'Thời điểm tạo đánh giá',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-01T10:00:00.000Z',
    description: 'Thời điểm cập nhật đánh giá',
  })
  updatedAt: Date;
}
