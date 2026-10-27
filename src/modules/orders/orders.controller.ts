import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { Admin } from '../../common/decorators';
import { OrdersService } from './orders.service';
import { OrderDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() b: OrderDto, @Req() req: any) {
    return this.ordersService.createOrder(req.user, b);
  }

  @Get('myorders')
  listMine(@Req() req: any) {
    return this.ordersService.findUserOrders(req.user._id);
  }

  @Admin()
  @Get('stats')
  stats() {
    return this.ordersService.getStats();
  }

  @Admin()
  @Get()
  async list(@Req() req: any) {
    return this.ordersService.findAll(req.user);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  @Put(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'cancel');
  }

  @Admin()
  @Put(':id/pay')
  pay(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'pay');
  }

  @Admin()
  @Put(':id/deliver')
  deliver(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.transition(id, req.user, 'deliver');
  }
}
