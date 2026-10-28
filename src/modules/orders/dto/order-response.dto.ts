import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class OrderItemDetailDto {
  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm',
  })
  product: string;

  @ApiProperty({
    example: 'iPhone 15 Pro Max 256GB',
    description: 'Tên sản phẩm tại thời điểm đặt hàng',
  })
  name: string;

  @ApiProperty({
    example: 'http://localhost:5000/uploads/sample-product.jpg',
    description: 'Hình ảnh sản phẩm',
  })
  image: string;

  @ApiProperty({
    example: 'Điện thoại',
    description: 'Danh mục sản phẩm',
  })
  category: string;

  @ApiProperty({
    example: 29990000,
    description: 'Đơn giá niêm yết tại thời điểm tạo đơn (VNĐ)',
  })
  price: number;

  @ApiProperty({
    example: 2,
    description: 'Số lượng mua',
  })
  qty: number;
}

export class OrderResponseDto {
  @ApiProperty({
    example: 'f18c642e-13c5-4ceb-8526-25e24c2fece9',
    description: 'UUID của đơn hàng',
  })
  _id: string;

  @ApiProperty({
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
    description: 'UUID của người dùng đặt đơn',
  })
  userId: string;

  @ApiProperty({
    type: [OrderItemDetailDto],
    description: 'Danh sách các mặt hàng trong đơn hàng',
  })
  orderItems: OrderItemDetailDto[];

  @ApiProperty({
    type: AddressDto,
    description: 'Địa chỉ giao hàng',
  })
  shippingAddress: AddressDto;

  @ApiProperty({
    example: 'COD',
    description: 'Phương thức thanh toán',
  })
  paymentMethod: string;

  @ApiProperty({
    example: 59980000,
    description: 'Tổng tiền hàng chưa bao gồm thuế và phí vận chuyển (VNĐ)',
  })
  itemsPrice: number;

  @ApiProperty({
    example: 0,
    description: 'Phí vận chuyển (VNĐ) - Miễn phí khi tổng tiền hàng > 10.000.000đ',
  })
  shippingPrice: number;

  @ApiProperty({
    example: 5998000,
    description: 'Thuế giá trị gia tăng VAT 10% (VNĐ)',
  })
  taxPrice: number;

  @ApiProperty({
    example: 0,
    description: 'Số tiền được giảm trừ qua mã khuyến mãi coupon (VNĐ)',
  })
  discountAmount: number;

  @ApiPropertyOptional({
    example: 'SUMMER2026',
    description: 'Mã khuyến mãi đã áp dụng',
  })
  couponCode?: string;

  @ApiProperty({
    example: 65978000,
    description: 'Tổng tiền thanh toán cuối cùng của đơn hàng (VNĐ)',
  })
  totalPrice: number;

  @ApiProperty({
    example: false,
    description: 'Trạng thái đã thanh toán hay chưa',
  })
  isPaid: boolean;

  @ApiProperty({
    example: false,
    description: 'Trạng thái đã giao hàng hay chưa',
  })
  isDelivered: boolean;

  @ApiProperty({
    example: false,
    description: 'Trạng thái đơn hàng đã bị hủy hay chưa',
  })
  isCancelled: boolean;

  @ApiPropertyOptional({
    example: '2026-01-16T10:00:00.000Z',
    description: 'Thời điểm thanh toán',
  })
  paidAt?: Date;

  @ApiPropertyOptional({
    example: '2026-01-17T15:30:00.000Z',
    description: 'Thời điểm giao hàng thành công',
  })
  deliveredAt?: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm tạo đơn hàng',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm cập nhật đơn hàng gần nhất',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: UserResponseDto,
    description: 'Thông tin người dùng đặt đơn (chỉ có khi xem chi tiết hoặc Admin xem danh sách)',
  })
  user?: UserResponseDto;
}
