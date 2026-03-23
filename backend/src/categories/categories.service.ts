import { Injectable, BadRequestException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TenantDbService } from '../common/services/tenant-db.service';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesService {
  constructor(
    private tenantDb: TenantDbService,
    @Inject(REQUEST) private req: Request,
  ) {}

  private async ds(): Promise<DataSource> {
    const tenantId = this.req['tenantId'];
    return this.tenantDb.getDataSource(tenantId);
  }

  async findAll() {
    const ds = await this.ds();
    return ds.getRepository(Category).find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findOne(id: number) {
    const ds = await this.ds();
    return ds.getRepository(Category).findOne({ where: { id } });
  }

  async create(dto: CreateCategoryDto) {
    const ds = await this.ds();
    const repo = ds.getRepository(Category);
    return repo.save(repo.create(dto));
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const ds = await this.ds();
    await ds.getRepository(Category).update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const ds = await this.ds();
    const repo = ds.getRepository(Category);
    const category = await repo.findOne({ where: { id }, relations: ['products'] });
    const products = category?.products || [];
    if (products.length > 0) {
      throw new BadRequestException('此分類下仍有品項，無法刪除');
    }
    return repo.delete(id);
  }
}