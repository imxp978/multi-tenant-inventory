import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantDbService } from '../common/services/tenant-db.service';

@Module({
  providers: [UsersService, TenantDbService],
  exports: [UsersService],
})
export class UsersModule {}