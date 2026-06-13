import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CostService } from '../services/cost.service';
@Controller('cost-summaries')
export class CostController {
  constructor(private readonly service: CostService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Get('detail')
  findDetail(@Query('vehicleId') vehicleId: string, @Query('month') month: string) {
    return this.service.findDetail(Number(vehicleId), month);
  }
  @Post() create(@Body() payload: any) { return this.service.create(payload); }
}
