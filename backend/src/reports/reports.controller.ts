import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('monthly')
  monthly(@Query('year') year: string, @Query('month') month: string) {
    return this.service.monthly(+year, +month);
  }
}
