import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateMinerDto } from './dto/miners.dto';
import { CreateHiltiDto } from './dto/hiltis.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //! HILTIS
  @Get('get-hiltis')
  async getHiltis() {
    return this.adminService.getHiltis();
  }

  @Post('create-hilti')
  async createHilti(@Body() hilti: CreateHiltiDto) {
    return this.adminService.createHilti(hilti);
  }

  @Put('update-hilti/:id')
  async updateHilti(@Param('id') id: string, @Body() hilti: CreateHiltiDto) {
    return this.adminService.updateHilti(id, hilti);
  }

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
