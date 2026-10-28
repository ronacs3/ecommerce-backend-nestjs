import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewResponseDto } from './review-response.dto';

export class ProductResponseDto {
  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm',
  })
  _id: string;

  @ApiProperty({
    example: 'iPhone 15 Pro Max 256GB',
    description: 'Tên sản phẩm',
  })
  name: string;

  @ApiProperty({
    example: 'Apple',
    description: 'Thương hiệu sản phẩm',
  })
  brand: string;

  @ApiProperty({
    example: 'Điện thoại',
    description: 'Tên danh mục sản phẩm',
  })
  category: string;

  @ApiProperty({
    example: 'Thiết kế khung titan sang trọng, chip A17 Pro mạnh mẽ vượt trội.',
    description: 'Mô tả chi tiết sản phẩm',
  })
  description: string;

  @ApiProperty({
    example: 'http://localhost:5000/uploads/sample-product.jpg',
    description: 'Ảnh đại diện chính của sản phẩm',
  })
  image: string;

  @ApiProperty({
    example: [
      'http://localhost:5000/uploads/sample-1.jpg',
      'http://localhost:5000/uploads/sample-2.jpg',
    ],
    description: 'Danh sách các ảnh phụ của sản phẩm',
    type: [String],
  })
  images: string[];

  @ApiProperty({
    example: 29990000,
    description: 'Giá bán (VNĐ)',
  })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Số lượng tồn kho',
  })
  countInStock: number;

  @ApiPropertyOptional({
    type: [ReviewResponseDto],
    description: 'Danh sách các đánh giá của khách hàng',
  })
  reviews?: ReviewResponseDto[];

  @ApiProperty({
    example: 1,
    description: 'Tổng số lượt đánh giá',
  })
  numReviews: number;

  @ApiProperty({
    example: 4.8,
    description: 'Điểm đánh giá trung bình (1 - 5 sao)',
  })
  rating: number;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm tạo sản phẩm',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm cập nhật sản phẩm gần nhất',
  })
  updatedAt: Date;
}
