import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService, TenantDbService],
})
export class OrdersModule {}