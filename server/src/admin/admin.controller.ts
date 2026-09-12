import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateMinerDto } from './dto/miners.dto';
import { CreateHiltiDto } from './dto/hiltis.dto';
import { CreateBoosterDto } from './dto/boosters.dto';
import { AdminRanksService } from './admin.ranks.service';
import { CreateMarketItemDto } from './dto/market.dto';
import { CreateTaskDto } from './dto/tasks.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AdminApiKeyGuard } from 'src/common/guards/admin-api-key.guard';

@Public() // Telegram initData beklenmez — istek panelden gelir
@UseGuards(AdminApiKeyGuard)
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

  //! Boosters
  @Get('get-boosters')
  async getBoosters() {
    return this.adminService.getBoosters();
  }

  @Post('create-booster')
  async createBooster(@Body() booster: CreateBoosterDto) {
    return this.adminService.createBooster(booster);
  }

  @Put('update-booster/:id')
  async updateBooster(
    @Param('id') id: string,
    @Body() booster: CreateBoosterDto,
  ) {
    console.log('update-booster working...');
    return this.adminService.updateBooster(id, booster);
  }

  //! MARKET
  @Get('get-market-items')
  async getMarket() {
    return this.adminService.getMarket();
  }

  @Post('create-market-item')
  async createMarketItem(@Body() marketItem: CreateMarketItemDto) {
    return this.adminService.createMarketItem(marketItem);
  }

  @Put('update-market-item/:id')
  async updateMarketItem(
    @Param('id') id: string,
    @Body() marketItem: CreateMarketItemDto,
  ) {
    return this.adminService.updateMarketItem(id, marketItem);
  }

  //! TASKS
  @Get('get-tasks')
  async getTasks() {
    return this.adminService.getTasks();
  }

  @Post('create-task')
  async createTask(@Body() task: CreateTaskDto) {
    return this.adminService.createTask(task);
  }

  @Put('update-task/:id')
  async updateTask(@Param('id') id: string, @Body() task: CreateTaskDto) {
    return this.adminService.updateTask(id, task);
  }
}

@Public()
@UseGuards(AdminApiKeyGuard)
@Controller('admin/schedules')
export class AdminRanksController {
  constructor(private readonly adminRanksService: AdminRanksService) {}

  @Post('handle-weekly-invites')
  async handleWeeklyInvites() {
    return this.adminRanksService.handleWeeklyInvitesLeaderboardRewards();
  }
}
