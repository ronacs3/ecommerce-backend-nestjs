import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Public, Admin } from '../../common/decorators';
import { CouponsService } from './coupons.service';
import { CouponDto, CouponCheckDto } from './dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Post('validate')
  async validate(@Body() b: CouponCheckDto) {
    return this.couponsService.validateCoupon(b);
  }

  @Admin()
  @Get()
  list() {
    return this.couponsService.findAll();
  }

  @Admin()
  @Post()
  async create(@Body() b: CouponDto) {
    return this.couponsService.create(b);
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.remove(id);
  }
}
