import { Injectable, NotFoundException, BadRequestException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductsService } from '../products/products.service';
import { TenantDbService } from '../common/services/tenant-db.service';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService {
  constructor(
    private tenantDb: TenantDbService,
    private productsService: ProductsService,
    @Inject(REQUEST) private req: Request,
  ) {}

  private async ds(): Promise<DataSource> {
    const tenantId = this.req['tenantId'];
    return this.tenantDb.getDataSource(tenantId);
  }

  async findByDate(date: string) {
    const ds = await this.ds();
    return ds.getRepository(Order).findOne({
      where: { orderDate: date },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });
  }

  async ensure(date: string, userId: number) {
    const ds = await this.ds();
    const orderRepo = ds.getRepository(Order);
    let order = await this.findByDate(date);
    if (!order) {
      order = await orderRepo.save(
        orderRepo.create({ orderDate: date, createdBy: userId })
      );
      order.items = [];
    }
    return order;
  }

  async addItem(orderId: number, dto: { variantId: number; quantity: number; unitPrice: number }) {
    const ds = await this.ds();
    const itemRepo = ds.getRepository(OrderItem);

    const variant = await this.productsService.findVariantById(dto.variantId);
    if (!variant) throw new NotFoundException('變體不存在');
    if (variant.stock < dto.quantity) {
      throw new BadRequestException(`庫存不足 (目前: ${variant.stock})`);
    }

    const subtotal = dto.quantity * dto.unitPrice;
    const item = await itemRepo.save(
      itemRepo.create({ orderId, variantId: dto.variantId, quantity: dto.quantity, unitPrice: dto.unitPrice, subtotal })
    );

    await this.productsService.adjustStock(dto.variantId, -dto.quantity);
    await this.recalcTotal(orderId);

    return itemRepo.findOne({
      where: { id: item.id },
      relations: ['variant', 'variant.product'],
    });
  }

  async removeItem(orderId: number, itemId: number) {
    const ds = await this.ds();
    const itemRepo = ds.getRepository(OrderItem);

    const item = await itemRepo.findOne({ where: { id: itemId, orderId } });
    if (!item) throw new NotFoundException('明細不存在');

    await this.productsService.adjustStock(item.variantId, item.quantity);
    await itemRepo.delete(itemId);
    await this.recalcTotal(orderId);
  }

  private async recalcTotal(orderId: number) {
    const ds = await this.ds();
    const result = await ds.getRepository(OrderItem)
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.subtotal), 0)', 'total')
      .where('item.orderId = :orderId', { orderId })
      .getRawOne();
    await ds.getRepository(Order).update(orderId, { totalAmount: result.total });
  }
}