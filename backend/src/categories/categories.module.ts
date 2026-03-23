import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, TenantDbService],
  exports: [CategoriesService],
})
export class CategoriesModule {}