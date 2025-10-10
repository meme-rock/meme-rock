import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateMinerDto } from './dto/miners.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //! MINERS
  @Get('get-miners')
  async getMiners() {
    return this.adminService.getMiners();
  }

  @Post('create-miner')
  async createMiner(@Body() miner: CreateMinerDto) {
    return this.adminService.createMiner(miner);
  }

  @Put('update-miner/:id')
  async updateMiner(@Param('id') id: string, @Body() miner: CreateMinerDto) {
    return this.adminService.updateMiner(id, miner);
  }
}
