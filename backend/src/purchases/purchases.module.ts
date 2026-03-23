import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { ProductsModule } from '../products/products.module';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  imports: [ProductsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService, TenantDbService],
})
export class PurchasesModule {}