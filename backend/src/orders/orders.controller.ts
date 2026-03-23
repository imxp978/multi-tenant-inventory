import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { EnsureOrderDto } from './dto/ensure-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  findByDate(@Query('date') date: string) {
    return this.service.findByDate(date);
  }

  @Post('ensure')
  ensure(@Body() dto: EnsureOrderDto, @Req() req: any) {
    return this.service.ensure(dto.date, req.user.id);
  }

  @Post(':orderId/items')
  addItem(@Param('orderId', ParseIntPipe) orderId: number, @Body() dto: AddOrderItemDto) {
    return this.service.addItem(orderId, dto);
  }

  @Delete(':orderId/items/:itemId')
  removeItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.service.removeItem(orderId, itemId);
  }
}
