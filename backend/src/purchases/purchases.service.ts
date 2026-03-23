import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { Purchase } from './purchase.entity';
import { ProductsService } from '../products/products.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TenantDbService } from '../common/services/tenant-db.service';

@Injectable({ scope: Scope.REQUEST })
export class PurchasesService {
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
    return ds.getRepository(Purchase).find({
      where: { purchaseDate: date },
      relations: ['variant', 'variant.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreatePurchaseDto, userId: number) {
    const ds = await this.ds();
    const repo = ds.getRepository(Purchase);

    const variant = await this.productsService.findVariantById(dto.variantId);
    if (!variant) throw new NotFoundException('規格不存在');

    try {
      const purchase = await repo.save(
        repo.create({ ...dto, createdBy: userId }),
      );
      await this.productsService.adjustStock(dto.variantId, dto.quantity);
      return repo.findOne({
        where: { id: purchase.id },
        relations: ['variant', 'variant.product'],
      });
    } catch (err) {
      throw new BadRequestException('新增進貨失敗：' + err.message);
    }
  }

  async remove(id: number) {
    const ds = await this.ds();
    const repo = ds.getRepository(Purchase);

    const purchase = await repo.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException('進貨紀錄不存在');

    try {
      await this.productsService.adjustStock(
        purchase.variantId,
        -purchase.quantity,
      );
      return await repo.delete(id);
    } catch (err) {
      throw new BadRequestException('刪除進貨失敗：' + err.message);
    }
  }
}
