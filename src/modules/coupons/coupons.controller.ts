import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, Admin } from '../../common/decorators';
import { MessageResponseDto, ErrorResponseDto } from '../../common/dto';
import { CouponsService } from './coupons.service';
import { CouponDto, CouponCheckDto, CouponResponseDto } from './dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Post('validate')
  @ApiOperation({
    summary: 'Kiểm tra tính hợp lệ của mã giảm giá',
    description:
      'Xác thực mã giảm giá có tồn tại hay không, còn trong hạn sử dụng và các sản phẩm trong giỏ hàng có thuộc danh mục được áp dụng coupon hay không.',
  })
  @ApiBody({
    type: CouponCheckDto,
    examples: {
      default: {
        summary: 'Kiểm tra coupon với giỏ hàng',
        value: {
          code: 'SUMMER2026',
          cartItems: [
            { product: 'a587989f-22a0-4a81-b552-32b7816d56df' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mã giảm giá hợp lệ và có thể áp dụng',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Mã giảm giá không hợp lệ, đã hết hạn hoặc không áp dụng cho sản phẩm trong giỏ hàng',
    type: ErrorResponseDto,
  })
  async validate(@Body() b: CouponCheckDto) {
    return this.couponsService.validateCoupon(b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả mã giảm giá (Chỉ dành cho Admin)',
    description: 'Quản trị viên xem toàn bộ mã giảm giá đã được tạo trong hệ thống.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các mã giảm giá',
    type: [CouponResponseDto],
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
  list() {
    return this.couponsService.findAll();
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({
    summary: 'Tạo mới mã giảm giá (Chỉ dành cho Admin)',
    description:
      'Tạo mã coupon khuyến mãi với phần trăm giảm (1-100%), ngày hết hạn (trong tương lai) và danh mục áp dụng tương ứng.',
  })
  @ApiBody({
    type: CouponDto,
    examples: {
      allCategories: {
        summary: 'Mã giảm giá áp dụng toàn bộ sản phẩm',
        value: {
          code: 'SUMMER2026',
          discount: 10,
          expirationDate: '2026-12-31T23:59:59.000Z',
          applicableCategories: [],
        },
      },
      specificCategory: {
        summary: 'Mã giảm giá theo danh mục cụ thể',
        value: {
          code: 'PHONE15',
          discount: 15,
          expirationDate: '2026-12-31T23:59:59.000Z',
          applicableCategories: ['Điện thoại'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mã giảm giá thành công',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Mã đã tồn tại, ngày hết hạn ở quá khứ hoặc danh mục chỉ định không tồn tại',
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
  async create(@Body() b: CouponDto) {
    return this.couponsService.create(b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa mã giảm giá theo ID (Chỉ dành cho Admin)',
    description: 'Xóa vĩnh viễn một mã giảm giá khỏi hệ thống theo UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của mã giảm giá cần xóa',
    format: 'uuid',
    example: 'e2912efc-1b77-4977-b9fa-9481b4f4c21e',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa mã giảm giá thành công',
    type: MessageResponseDto,
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
    description: 'Không tìm thấy mã giảm giá',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.remove(id);
  }
}
