import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Between } from 'typeorm';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { TenantDbService } from '../common/services/tenant-db.service';

@Injectable({ scope: Scope.REQUEST })
export class ReportsService {
  constructor(
    private tenantDb: TenantDbService,
    @Inject(REQUEST) private req: Request,
  ) {}

  private async ds(): Promise<DataSource> {
    const tenantId = this.req['tenantId'];
    return this.tenantDb.getDataSource(tenantId);
  }

  async monthly(year: number, month: number) {
    const ds = await this.ds();
    const orderRepo = ds.getRepository(Order);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const orders = await orderRepo.find({
      where: { orderDate: Between(startDate, endDate) as any },
      relations: ['items', 'items.variant', 'items.variant.product', 'items.variant.product.category'],
    });

    let totalRevenue = 0, totalCost = 0, totalItemsSold = 0;
    const productMap = new Map<number, any>();
    const dailyMap = new Map<string, { orderTotal: number; itemCount: number }>();

    for (const order of orders) {
      const day = order.orderDate;
      if (!dailyMap.has(day)) dailyMap.set(day, { orderTotal: 0, itemCount: 0 });
      const daily = dailyMap.get(day)!;

      for (const item of order.items || []) {
        const revenue = Number(item.subtotal);
        const cost = Number(item.variant?.costPrice || 0) * item.quantity;

        totalRevenue += revenue;
        totalCost += cost;
        totalItemsSold += item.quantity;
        daily.orderTotal += revenue;
        daily.itemCount += item.quantity;

        const pid = item.variant?.product?.id;
        if (!pid) continue;

        if (!productMap.has(pid)) {
          productMap.set(pid, {
            productId: pid,
            productName: item.variant.product.name,
            sku: item.variant.product.sku,
            category: item.variant.product.category?.name || '',
            variants: new Map(),
            totalQuantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0,
          });
        }
        const pm = productMap.get(pid)!;
        const color = item.variant.color;
        if (!pm.variants.has(color)) {
          pm.variants.set(color, { color, quantitySold: 0, revenue: 0, cost: 0, profit: 0 });
        }
        const vm = pm.variants.get(color)!;
        vm.quantitySold += item.quantity;
        vm.revenue += revenue;
        vm.cost += cost;
        vm.profit += revenue - cost;
        pm.totalQuantity += item.quantity;
        pm.totalRevenue += revenue;
        pm.totalCost += cost;
        pm.totalProfit += revenue - cost;
      }
    }

    return {
      year, month,
      summary: {
        totalRevenue, totalCost,
        grossProfit: totalRevenue - totalCost,
        totalOrders: orders.length,
        totalItemsSold,
      },
      byProduct: Array.from(productMap.values()).map(p => ({
        ...p,
        variants: Array.from(p.variants.values()),
      })),
      dailyBreakdown: Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }
}