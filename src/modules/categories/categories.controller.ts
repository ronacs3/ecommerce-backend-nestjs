import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  forwardRef,
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
import { CategoriesService } from './categories.service';
import {
  CategoryDto,
  CategoryResponseDto,
  CategoryDetailResponseDto,
} from './dto';
import { ProductsService } from '../products/products.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả danh mục sản phẩm',
    description:
      'Lấy toàn bộ danh sách các danh mục hàng hóa trong hệ thống, sắp xếp theo thời gian tạo mới nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các danh mục',
    type: [CategoryResponseDto],
  })
  list() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết danh mục kèm danh sách sản phẩm',
    description:
      'Trả về thông tin chi tiết của danh mục kèm theo tất cả các sản phẩm đang thuộc về danh mục này.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của danh mục',
    format: 'uuid',
    example: 'c4e97668-cbdf-4993-80f4-fb35567bfa37',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết danh mục kèm danh sách sản phẩm',
    type: CategoryDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy danh mục với ID đã cung cấp',
    type: ErrorResponseDto,
  })
  async detail(@Param('id', ParseUUIDPipe) id: string) {
    const c = await this.categoriesService.findOne(id);
    return {
      ...c,
      products: await this.productsService.findAll({ category: c.name }),
    };
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({
    summary: 'Tạo danh mục sản phẩm mới (Chỉ dành cho Admin)',
    description:
      'Tạo nhóm phân loại hàng hóa mới. Tên danh mục là duy nhất trong toàn hệ thống.',
  })
  @ApiBody({
    type: CategoryDto,
    examples: {
      default: {
        summary: 'Mẫu tạo danh mục sản phẩm',
        value: {
          name: 'Điện thoại',
          description:
            'Các dòng điện thoại thông minh, smartphone chính hãng mới nhất',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo danh mục mới thành công',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên danh mục đã tồn tại',
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
  create(@Body() b: CategoryDto) {
    return this.categoriesService.create(b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật danh mục sản phẩm theo ID (Chỉ dành cho Admin)',
    description: 'Cập nhật tên hoặc mô tả của một danh mục sản phẩm đã có.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của danh mục cần cập nhật',
    format: 'uuid',
    example: 'c4e97668-cbdf-4993-80f4-fb35567bfa37',
  })
  @ApiBody({
    type: CategoryDto,
    examples: {
      default: {
        summary: 'Mẫu cập nhật danh mục sản phẩm',
        value: {
          name: 'Điện thoại & Phụ kiện',
          description:
            'Điện thoại thông minh, tai nghe, sạc nhanh và phụ kiện chính hãng',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật danh mục thành công',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Tên danh mục mới bị trùng với danh mục khác',
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
    description: 'Không tìm thấy danh mục để cập nhật',
    type: ErrorResponseDto,
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() b: CategoryDto) {
    return this.categoriesService.update(id, b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa danh mục sản phẩm theo ID (Chỉ dành cho Admin)',
    description: 'Xóa vĩnh viễn danh mục khỏi hệ thống.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của danh mục cần xóa',
    format: 'uuid',
    example: 'c4e97668-cbdf-4993-80f4-fb35567bfa37',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa danh mục thành công',
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
    description: 'Không tìm thấy danh mục để xóa',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
