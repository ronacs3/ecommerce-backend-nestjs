import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class CategoryDetailResponseDto extends CategoryResponseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: 'a587989f-22a0-4a81-b552-32b7816d56df' },
        name: { type: 'string', example: 'iPhone 15 Pro Max 256GB' },
        category: { type: 'string', example: 'Điện thoại' },
        brand: { type: 'string', example: 'Apple' },
        price: { type: 'number', example: 29990000 },
        countInStock: { type: 'number', example: 50 },
        image: { type: 'string', example: 'http://localhost:5000/uploads/sample.jpg' },
        rating: { type: 'number', example: 4.8 },
        numReviews: { type: 'number', example: 12 },
      },
    },
    description: 'Danh sách các sản phẩm trực thuộc danh mục',
  })
  products: any[];
}
