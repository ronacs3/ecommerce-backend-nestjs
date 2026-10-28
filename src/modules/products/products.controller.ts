import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  ServiceUnavailableException,
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
import { ProductsService } from './products.service';
import {
  ProductDto,
  ReviewDto,
  CompareDto,
  ProductQueryDto,
  ProductResponseDto,
} from './dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm (có tìm kiếm & lọc)',
    description:
      'Lấy danh sách sản phẩm theo từ khóa (keyword), tên danh mục (category) và khoảng giá (minPrice, maxPrice). Danh sách kèm thông tin đánh giá sao trung bình và số lượt đánh giá.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm thỏa mãn điều kiện lọc',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Khoảng giá không hợp lệ',
    type: ErrorResponseDto,
  })
  list(@Query() q: ProductQueryDto) {
    return this.productsService.findAll(q as Record<string, string>);
  }

  @Public()
  @Get('categories')
  @ApiOperation({
    summary: 'Lấy danh sách tên tất cả danh mục có sản phẩm',
    description: 'Trả về mảng chứa tên các danh mục duy nhất đã có trong hệ thống.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tên các danh mục',
    schema: {
      type: 'array',
      items: { type: 'string', example: 'Điện thoại' },
    },
  })
  async categories() {
    return this.productsService.getCategoryNames();
  }

  @Public()
  @Post('compare-ai')
  @ApiOperation({
    summary: 'So sánh các sản phẩm bằng trí tuệ nhân tạo (AI)',
    description:
      'Gửi danh sách 2 đến 4 ID sản phẩm để AI đối chiếu và so sánh cấu hình, ưu nhược điểm (tính năng đang phát triển).',
  })
  @ApiBody({
    type: CompareDto,
    examples: {
      default: {
        summary: 'Mẫu so sánh 2 sản phẩm',
        value: {
          products: [
            { _id: 'a587989f-22a0-4a81-b552-32b7816d56df' },
            { _id: 'b6e8281a-33b1-4b92-c663-43c8927e67ea' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Chưa cấu hình nhà cung cấp AI để so sánh sản phẩm',
    type: ErrorResponseDto,
  })
  compare(@Body() _b: CompareDto) {
    throw new ServiceUnavailableException(
      'Chưa cấu hình nhà cung cấp AI để so sánh sản phẩm',
    );
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({
    summary: 'Lấy danh sách các sản phẩm liên quan',
    description:
      'Gợi ý tối đa 4 sản phẩm cùng danh mục với sản phẩm hiện tại (loại trừ chính sản phẩm này).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của sản phẩm',
    format: 'uuid',
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm cùng danh mục',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm gốc',
    type: ErrorResponseDto,
  })
  async related(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getRelated(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một sản phẩm theo ID',
    description:
      'Trả về đầy đủ thông tin sản phẩm, danh sách các đánh giá của khách hàng, điểm đánh giá trung bình và số lượng tồn kho.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của sản phẩm',
    format: 'uuid',
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết sản phẩm',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm',
    type: ErrorResponseDto,
  })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({
    summary: 'Thêm mới sản phẩm (Chỉ dành cho Admin)',
    description:
      'Tạo sản phẩm mới với tên, danh mục, giá, mô tả, ảnh và số lượng trong kho ban đầu.',
  })
  @ApiBody({
    type: ProductDto,
    examples: {
      default: {
        summary: 'Mẫu tạo sản phẩm mới',
        value: {
          name: 'iPhone 15 Pro Max 256GB',
          category: 'Điện thoại',
          brand: 'Apple',
          price: 29990000,
          countInStock: 50,
          description:
            'Thiết kế khung titan sang trọng, chip A17 Pro mạnh mẽ vượt trội.',
          image: 'http://localhost:5000/uploads/sample-product.jpg',
          images: [
            'http://localhost:5000/uploads/sample-1.jpg',
            'http://localhost:5000/uploads/sample-2.jpg',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc danh mục không tồn tại',
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
  async create(@Body() b: ProductDto) {
    return this.productsService.create(b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin sản phẩm theo ID (Chỉ dành cho Admin)',
    description:
      'Thay đổi thông tin như tên, danh mục, giá bán, ảnh, mô tả hoặc số lượng tồn kho của sản phẩm.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của sản phẩm cần cập nhật',
    format: 'uuid',
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
  })
  @ApiBody({
    type: ProductDto,
    examples: {
      default: {
        summary: 'Mẫu cập nhật sản phẩm',
        value: {
          name: 'iPhone 15 Pro Max 512GB (Titan Tự Nhiên)',
          category: 'Điện thoại',
          brand: 'Apple',
          price: 34990000,
          countInStock: 30,
          description: 'Bản nâng cấp bộ nhớ 512GB siêu mượt mà.',
          image: 'http://localhost:5000/uploads/sample-product.jpg',
          images: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu cập nhật không hợp lệ',
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
    description: 'Không tìm thấy sản phẩm cần cập nhật',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() b: ProductDto,
  ) {
    return this.productsService.update(id, b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa sản phẩm theo ID (Chỉ dành cho Admin)',
    description: 'Xóa vĩnh viễn sản phẩm khỏi hệ thống.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của sản phẩm cần xóa',
    format: 'uuid',
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa sản phẩm thành công',
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
    description: 'Không tìm thấy sản phẩm để xóa',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Post(':id/reviews')
  @ApiOperation({
    summary: 'Đánh giá sản phẩm đã mua',
    description:
      'Chỉ những khách hàng đã mua sản phẩm này trong một đơn hàng đã thanh toán mới được phép gửi đánh giá. Mỗi khách hàng chỉ được đánh giá 1 lần duy nhất cho mỗi sản phẩm.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của sản phẩm cần đánh giá',
    format: 'uuid',
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
  })
  @ApiBody({
    type: ReviewDto,
    examples: {
      default: {
        summary: 'Mẫu đánh giá 5 sao',
        value: {
          rating: 5,
          comment:
            'Sản phẩm đóng gói rất cẩn thận, dùng mượt mà và đúng như mô tả!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi đánh giá thành công',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bạn chưa mua và thanh toán cho sản phẩm này, hoặc bạn đã đánh giá sản phẩm này trước đó',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm',
    type: ErrorResponseDto,
  })
  async review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() b: ReviewDto,
    @Req() req: any,
  ) {
    return this.productsService.addReview(id, req.user, b);
  }
}
