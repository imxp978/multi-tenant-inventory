import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, TenantDbService],
})
export class ReportsModule {}