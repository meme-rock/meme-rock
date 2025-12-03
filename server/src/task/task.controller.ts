import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { ClaimTaskDto } from './dto/task.dto';

@Controller('task')
@UseGuards(CustomThrottlerGuard)
@Throttle({ default: { limit: 1, ttl: 2000 } })
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Daily task'ı doğrular (Telegram kanalı, reklam izleme vs.)
   * Örnek: POST /task/verify-daily/123456789 { task_id: "task_id_here" }
   */
  @Post('verify-daily/:user_id')
  async verifyDailyTask(
    @Param('user_id') user_id: string,
    @Body() dto: ClaimTaskDto,
  ) {
    return await this.taskService.verifyDailyTask(user_id, dto.task_id);
  }

  /**
   * Fake mod task başlatır (15 dakika süre)
   * Örnek: POST /task/start/123456789 { task_id: "task_id_here" }
   */
  @Post('start/:user_id')
  async startTask(
    @Param('user_id') user_id: string,
    @Body() dto: ClaimTaskDto,
  ) {
    return await this.taskService.startTask(user_id, dto.task_id);
  }

  /**
   * Task ödülünü claim eder (hem daily hem normal tasklar için)
   * Örnek: POST /task/claim/123456789 { task_id: "task_id_here" }
   */
  @Post('claim/:user_id')
  async claimTask(
    @Param('user_id') user_id: string,
    @Body() dto: ClaimTaskDto,
  ) {
    return await this.taskService.claimTask(user_id, dto.task_id);
  }

  /**
   * API tabanlı task'ı doğrular (Telegram API, X API vs.)
   * NOT: Şu an sadece yapı hazır, implementasyon gerekiyor
   * Örnek: POST /task/verify-api/123456789 { task_id: "task_id_here" }
   */
  @Post('verify-api/:user_id')
  async verifyApiTask(
    @Param('user_id') user_id: string,
    @Body() dto: ClaimTaskDto,
  ) {
    return await this.taskService.verifyApiTask(user_id, dto.task_id);
  }
}
