import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import { Public, Admin } from '../../common/decorators';
import { ProductsService } from './products.service';
import { ProductDto, ReviewDto, CompareDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  list(@Query() q: Record<string, string>) {
    return this.productsService.findAll(q);
  }

  @Public()
  @Get('categories')
  async categories() {
    return this.productsService.getCategoryNames();
  }

  @Public()
  @Post('compare-ai')
  compare(@Body() _b: CompareDto) {
    throw new ServiceUnavailableException('Chưa cấu hình nhà cung cấp AI để so sánh sản phẩm');
  }

  @Public()
  @Get(':id/related')
  async related(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getRelated(id);
  }

  @Public()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Admin()
  @Post()
  async create(@Body() b: ProductDto) {
    return this.productsService.create(b);
  }

  @Admin()
  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() b: ProductDto) {
    return this.productsService.update(id, b);
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/reviews')
  async review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() b: ReviewDto,
    @Req() req: any,
  ) {
    return this.productsService.addReview(id, req.user, b);
  }
}
