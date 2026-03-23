import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get('products')
  findAll(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.service.findAll(categoryId ? +categoryId : undefined, search);
  }

  @Get('products/:id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post('products')
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }

  @Put('products/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete('products/:id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Post('products/:id/variants')
  addVariant(@Param('id', ParseIntPipe) productId: number, @Body() dto: CreateVariantDto) {
    return this.service.addVariant(productId, dto);
  }

  @Put('variants/:id')
  updateVariant(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVariantDto) {
    return this.service.updateVariant(id, dto);
  }

  @Delete('variants/:id')
  removeVariant(@Param('id', ParseIntPipe) id: number) { return this.service.removeVariant(id); }
}
