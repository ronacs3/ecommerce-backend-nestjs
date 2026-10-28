import { ApiProperty } from '@nestjs/swagger';

export class DailyOrderStatDto {
  @ApiProperty({ example: '2026-01-15', description: 'Ngày (YYYY-MM-DD)' })
  _id: string;

  @ApiProperty({ example: 12, description: 'Số lượng đơn hàng được tạo trong ngày' })
  count: number;

  @ApiProperty({ example: 45000000, description: 'Tổng doanh thu các đơn đã thanh toán (VNĐ)' })
  totalSales: number;
}

export class OrderStatusStatDto {
  @ApiProperty({ example: true, description: 'Trạng thái thanh toán (true: đã thanh toán, false: chưa)' })
  _id: boolean;

  @ApiProperty({ example: 25, description: 'Số lượng đơn hàng thuộc trạng thái này' })
  count: number;
}

export class TopProductStatDto {
  @ApiProperty({ example: 'a587989f-22a0-4a81-b552-32b7816d56df', description: 'UUID của sản phẩm' })
  _id: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max 256GB', description: 'Tên sản phẩm' })
  name: string;

  @ApiProperty({ example: 38, description: 'Tổng số lượng đã bán' })
  totalQty: number;
}

export class OrderStatsResponseDto {
  @ApiProperty({
    type: [DailyOrderStatDto],
    description: 'Báo cáo doanh số và số lượng đơn hàng theo từng ngày',
  })
  dailyOrders: DailyOrderStatDto[];

  @ApiProperty({
    type: [OrderStatusStatDto],
    description: 'Thống kê tỷ lệ đơn đã thanh toán vs chưa thanh toán',
  })
  statusStats: OrderStatusStatDto[];

  @ApiProperty({
    type: [TopProductStatDto],
    description: 'Top 10 sản phẩm bán chạy nhất tính theo tổng số lượng bán ra',
  })
  topProducts: TopProductStatDto[];
}
