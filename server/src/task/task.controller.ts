import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { ClaimTaskDto } from './dto/task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('claim-daily-task/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async claimDailyTask(
    @Param('user_id') user_id: string,
    @Body() task: ClaimTaskDto,
  ) {
    console.log('Loading user:', user_id);
    return await this.taskService.claimDailyTask(user_id, task.task_id);
  }

  @Post('claim-common-task/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async claimCommonTask(
    @Param('user_id') user_id: string,
    @Body() task: ClaimTaskDto,
  ) {
    console.log('Loading user:', user_id);
    return await this.taskService.claimCommonTask(user_id, task.task_id);
  }

  @Post('claim-reusable-task/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async claimReusableTask(
    @Param('user_id') user_id: string,
    @Body() task: ClaimTaskDto,
  ) {
    console.log('Loading user:', user_id);
    return await this.taskService.claimReusableTask(user_id, task.task_id);
  }

  @Post('claim-partner-task/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async claimPartnerTask(
    @Param('user_id') user_id: string,
    @Body() task: ClaimTaskDto,
  ) {
    console.log('Loading user:', user_id);
    return await this.taskService.claimPartnerTask(user_id, task.task_id);
  }
}
