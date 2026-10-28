import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: 'c4e97668-cbdf-4993-80f4-fb35567bfa37',
    description: 'UUID của danh mục',
  })
  _id: string;

  @ApiProperty({
    example: 'Điện thoại',
    description: 'Tên danh mục sản phẩm',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Các dòng điện thoại thông minh, smartphone chính hãng mới nhất',
    description: 'Mô tả chi tiết',
  })
  description: string;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm tạo danh mục',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm cập nhật danh mục gần nhất',
  })
  updatedAt: Date;
}
