import { Injectable, OnModuleInit, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { TenantDbService } from '../common/services/tenant-db.service';
import { tenantIds } from '../config/tenants.config';

@Injectable({ scope: Scope.REQUEST })
export class UsersService implements OnModuleInit {
  constructor(
    private tenantDb: TenantDbService,
    @Inject(REQUEST) private req: Request,
  ) {}

  private async ds(): Promise<DataSource> {
    const tenantId = this.req['tenantId'];
    return this.tenantDb.getDataSource(tenantId);
  }

  async onModuleInit() {
    for (const tenantId of tenantIds) {
      try {
        const ds = await this.tenantDb.getDataSource(tenantId);
        const repo = ds.getRepository(User);
        const count = await repo.count();
        if (count === 0) {
          const hash = await bcrypt.hash('admin123', 10);
          await repo.save({ username: 'admin', password: hash, displayName: '管理員' });
          console.log(`Seeded admin for tenant: ${tenantId}`);
        }
      } catch (err) {
        console.error(`Seed failed for tenant ${tenantId}:`, err.message);
      }
    }
  }

  async findByUsername(username: string) {
    const ds = await this.ds();
    return ds.getRepository(User).findOne({ where: { username } });
  }

  async findById(id: number) {
    const ds = await this.ds();
    return ds.getRepository(User).findOne({ where: { id } });
  }
}