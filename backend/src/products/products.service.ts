import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { TenantDbService } from '../common/services/tenant-db.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(
    private tenantDb: TenantDbService,
    @Inject(REQUEST) private req: Request,
  ) {}

  private async ds(): Promise<DataSource> {
    const tenantId = this.req['tenantId'];
    return this.tenantDb.getDataSource(tenantId);
  }

  async findAll(categoryId?: number, search?: string) {
    const ds = await this.ds();
    const qb = ds
      .getRepository(Product)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.variants', 'v');
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (search)
      qb.andWhere('(p.name LIKE :s OR p.sku LIKE :s)', { s: `%${search}%` });
    qb.orderBy('p.name', 'ASC');
    const products = await qb.getMany();
    return products.map((p) => ({
      ...p,
      totalStock: p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0,
    }));
  }

  async findOne(id: number) {
    const ds = await this.ds();
    const p = await ds.getRepository(Product).findOne({
      where: { id },
      relations: ['category', 'variants'],
    });
    if (!p) throw new NotFoundException('品項不存在');
    return {
      ...p,
      totalStock: p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0,
    };
  }

  async create(dto: CreateProductDto) {
    const ds = await this.ds();
    const productRepo = ds.getRepository(Product);
    const variantRepo = ds.getRepository(ProductVariant);

    try {
      const product = productRepo.create({
        name: dto.name,
        sku: dto.sku,
        categoryId: dto.categoryId,
        sellingPrice: dto.sellingPrice || 0,
        supplierUrl: dto.supplierUrl,
      });
      const saved = await productRepo.save(product);
      if (dto.variants?.length) {
        const variants = dto.variants
          .filter((v) => v.color?.trim())
          .map((v) =>
            variantRepo.create({
              ...v,
              productId: saved.id,
              variantSku: v.variantSku || null,
              minStock: v.minStock ?? 1,
            }),
          );
        if (variants.length) await variantRepo.save(variants);
      }
      return this.findOne(saved.id);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(`SKU "${dto.sku}" 已存在`);
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    const ds = await this.ds();
    try {
      await ds.getRepository(Product).update(id, dto);
      return this.findOne(id);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('SKU 已存在');
      }
      throw err;
    }
  }

  async remove(id: number) {
    const ds = await this.ds();
    try {
      return await ds.getRepository(Product).delete(id);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('此商品已有訂單紀錄，無法刪除');
      }
      throw err;
    }
  }

  async addVariant(productId: number, dto: CreateVariantDto) {
    const ds = await this.ds();
    const variantRepo = ds.getRepository(ProductVariant);
    try {
      const variant = variantRepo.create({
        ...dto,
        productId,
        variantSku: dto.variantSku || null,
        minStock: dto.minStock ?? 1,
      });
      return await variantRepo.save(variant);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('此規格已存在');
      }
      throw err;
    }
  }

  async updateVariant(variantId: number, dto: UpdateVariantDto) {
    const ds = await this.ds();
    const variantRepo = ds.getRepository(ProductVariant);
    try {
      await variantRepo.update(variantId, dto);
      return variantRepo.findOne({ where: { id: variantId } });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('此規格已存在');
      }
      throw err;
    }
  }

  async removeVariant(variantId: number) {
    const ds = await this.ds();
    try {
      return await ds.getRepository(ProductVariant).delete(variantId);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('此規格已有訂單紀錄，無法刪除');
      }
      throw err;
    }
  }

  async findVariantById(id: number) {
    const ds = await this.ds();
    return ds
      .getRepository(ProductVariant)
      .findOne({ where: { id }, relations: ['product'] });
  }

  async adjustStock(variantId: number, delta: number) {
    const ds = await this.ds();
    await ds
      .getRepository(ProductVariant)
      .increment({ id: variantId }, 'stock', delta);
  }
}
