import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, TenantDbService],
  exports: [ProductsService],
})
export class ProductsModule {}