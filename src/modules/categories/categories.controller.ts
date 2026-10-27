import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Put, forwardRef } from '@nestjs/common';
import { Public, Admin } from '../../common/decorators';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto';
import { ProductsService } from '../products/products.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  @Public()
  @Get()
  list() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  async detail(@Param('id', ParseUUIDPipe) id: string) {
    const c = await this.categoriesService.findOne(id);
    return {
      ...c,
      products: await this.productsService.findAll({ category: c.name }),
    };
  }

  @Admin()
  @Post()
  create(@Body() b: CategoryDto) {
    return this.categoriesService.create(b);
  }

  @Admin()
  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() b: CategoryDto) {
    return this.categoriesService.update(id, b);
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
