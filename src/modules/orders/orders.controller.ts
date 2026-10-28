import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from '../../common/decorators';
import { ErrorResponseDto } from '../../common/dto';
import { OrdersService } from './orders.service';
import { OrderDto, OrderResponseDto, OrderStatsResponseDto } from './dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn đặt hàng mới',
    description:
      'Tạo đơn hàng từ giỏ hàng. Áp dụng pessimistic write lock để kiểm tra và trừ tồn kho, tính toán an toàn toàn bộ giá trị đơn hàng, phí vận chuyển (miễn phí nếu tiền hàng > 10 triệu, ngược lại 30.000đ), thuế VAT 10% và giảm giá coupon (nếu có).',
  })
  @ApiBody({
    type: OrderDto,
    examples: {
      default: {
        summary: 'Mẫu đặt đơn hàng trực tuyến',
        value: {
          orderItems: [
            {
              product: 'a587989f-22a0-4a81-b552-32b7816d56df',
              qty: 1,
            },
          ],
          shippingAddress: {
            fullName: 'Nguyễn Văn A',
            phone: '0901234567',
            address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
            city: 'Hồ Chí Minh',
            postalCode: '700000',
            country: 'Việt Nam',
          },
          paymentMethod: 'COD',
          couponCode: 'SUMMER2026',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng thành công',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Thiếu địa chỉ giao hàng, sản phẩm không đủ tồn kho hoặc mã giảm giá không hợp lệ',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  create(@Body() b: OrderDto, @Req() req: any) {
    return this.ordersService.createOrder(req.user, b);
  }

  @Get('myorders')
  @ApiOperation({
    summary: 'Lấy lịch sử đơn hàng của người dùng hiện tại',
    description:
      'Trả về toàn bộ danh sách đơn đặt hàng của tài khoản đang đăng nhập, sắp xếp theo thời gian tạo mới nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của người dùng',
    type: [OrderResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  listMine(@Req() req: any) {
    return this.ordersService.findUserOrders(req.user._id);
  }

  @Admin()
  @Get('stats')
  @ApiOperation({
    summary: 'Xem báo cáo thống kê doanh số bán hàng (Chỉ dành cho Admin)',
    description:
      'Tổng hợp số liệu doanh thu và số đơn theo ngày, thống kê tỷ lệ đơn đã thanh toán vs chưa thanh toán và danh sách top 10 sản phẩm bán chạy nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo thống kê bán hàng',
    type: OrderStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yêu cầu quyền quản trị viên (Admin)',
    type: ErrorResponseDto,
  })
  stats() {
    return this.ordersService.getStats();
  }

  @Admin()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả đơn hàng trong hệ thống (Chỉ dành cho Admin)',
    description:
      'Quản trị viên xem toàn bộ đơn hàng của tất cả khách hàng cùng thông tin người đặt mua.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả đơn hàng',
    type: [OrderResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yêu cầu quyền quản trị viên (Admin)',
    type: ErrorResponseDto,
  })
  async list(@Req() req: any) {
    return this.ordersService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết đơn hàng theo ID',
    description:
      'Khách hàng chỉ có thể xem đơn hàng do chính mình tạo; Quản trị viên (Admin) có thể xem chi tiết bất kỳ đơn hàng nào.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của đơn hàng',
    format: 'uuid',
    example: 'f18c642e-13c5-4ceb-8526-25e24c2fece9',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết đơn hàng',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập đơn hàng của người khác',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng',
    type: ErrorResponseDto,
  })
  detail(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Hủy đơn hàng',
    description:
      'Chủ đơn hàng hoặc Quản trị viên có thể hủy đơn hàng nếu đơn hàng chưa được thanh toán và chưa được giao. Hệ thống sẽ tự động hoàn lại số lượng tồn kho cho các sản phẩm trong database transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của đơn hàng cần hủy',
    format: 'uuid',
    example: 'f18c642e-13c5-4ceb-8526-25e24c2fece9',
  })
  @ApiResponse({
    status: 200,
    description: 'Hủy đơn hàng thành công và đã hoàn lại tồn kho sản phẩm',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Đơn hàng đã bị hủy từ trước hoặc không thể hủy đơn hàng đã thanh toán / giao hàng',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền hủy đơn hàng này',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng',
    type: ErrorResponseDto,
  })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'cancel');
  }

  @Admin()
  @Put(':id/pay')
  @ApiOperation({
    summary: 'Xác nhận đơn hàng đã thanh toán (Chỉ dành cho Admin)',
    description:
      'Quản trị viên xác nhận đã nhận được thanh toán từ khách hàng (chuyển isPaid thành true và ghi nhận thời điểm paidAt).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của đơn hàng',
    format: 'uuid',
    example: 'f18c642e-13c5-4ceb-8526-25e24c2fece9',
  })
  @ApiResponse({
    status: 200,
    description: 'Xác nhận thanh toán thành công',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Đơn hàng đã được thanh toán từ trước hoặc đơn hàng đã bị hủy',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yêu cầu quyền quản trị viên (Admin)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng',
    type: ErrorResponseDto,
  })
  pay(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'pay');
  }

  @Admin()
  @Put(':id/deliver')
  @ApiOperation({
    summary: 'Xác nhận đơn hàng đã được giao (Chỉ dành cho Admin)',
    description:
      'Quản trị viên đánh dấu đơn hàng đã được giao thành công đến tay khách hàng (yêu cầu đơn hàng đã được thanh toán trước).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của đơn hàng',
    format: 'uuid',
    example: 'f18c642e-13c5-4ceb-8526-25e24c2fece9',
  })
  @ApiResponse({
    status: 200,
    description: 'Xác nhận giao hàng thành công',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Đơn hàng chưa thanh toán hoặc đơn hàng đã được giao từ trước',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yêu cầu quyền quản trị viên (Admin)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng',
    type: ErrorResponseDto,
  })
  deliver(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'deliver');
  }
}
