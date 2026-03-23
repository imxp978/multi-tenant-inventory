import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('purchases')
@UseGuards(AuthGuard('jwt'))
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get()
  findByDate(@Query('date') date: string) { return this.service.findByDate(date); }

  @Post()
  create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
