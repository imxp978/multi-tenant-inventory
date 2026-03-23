import {
  Injectable,
  OnApplicationShutdown,
  OnApplicationBootstrap,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getTenantConfig, tenantIds } from '../../config/tenants.config';

@Injectable()
export class TenantDbService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private pool = new Map<string, DataSource>();

  // 啟動時就初始化所有 tenant 連線，synchronize 會自動建表
  async onApplicationBootstrap() {
    for (const tenantId of tenantIds) {
      try {
        await this.getDataSource(tenantId);
        console.log(`Connected to DB for tenant: ${tenantId}`);
      } catch (err) {
        console.error(`Failed to connect for tenant ${tenantId}:`, err.message);
      }
    }
  }

  async getDataSource(tenantId: string): Promise<DataSource> {
    if (this.pool.has(tenantId)) {
      return this.pool.get(tenantId)!;
    }

    const config = getTenantConfig(tenantId);
    if (!config) throw new NotFoundException(`Tenant "${tenantId}" not found`);

    const dataSource = new DataSource({
      ...config,
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: true,
    });

    await dataSource.initialize();
    this.pool.set(tenantId, dataSource);
    return dataSource;
  }

  async onApplicationShutdown() {
    for (const [, ds] of this.pool) {
      if (ds.isInitialized) await ds.destroy();
    }
  }
}
