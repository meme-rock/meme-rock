import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from 'src/schemas/task.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { BotService } from 'src/bot/bot.service';
import {
  EDailyTaskMatch,
  ETaskAPIType,
  ETaskType,
  EUserTaskStatus,
} from 'src/common/enums/tasks.enum';

export interface MergedTask extends Task {
  status: EUserTaskStatus;
  remaining_seconds: number;
}

@Injectable()
export class TaskService {
  private readonly FAKE_TASK_DURATION_MINUTES = 15;

  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly botService: BotService,
  ) {}

  // ================== PUBLIC METHODS ==================

  /**
   * Tüm taskları kullanıcının durumuna göre birleştirip döndürür
   */
  async returnMergedTasks(user: UserDocument): Promise<MergedTask[]> {
    try {
      const dbTasks = await this.taskModel.find().lean().exec();
      const userTaskMap = new Map(
        user.tasks.map((t) => [t.task_id.toString(), t]),
      );

      const mergedTasks: MergedTask[] = dbTasks.map((task) => {
        const taskId = task._id.toString();
        const userTask = userTaskMap.get(taskId);

        let status = EUserTaskStatus.PENDING;
        let remainingSeconds = 0;

        // Daily task kontrolü
        if (task.task_type === ETaskType.DAILY && task.daily_task_match) {
          status = this.getDailyTaskStatus(user, task.daily_task_match);
        }
        // Normal task kontrolü
        else if (userTask) {
          const taskStatus = this.calculateTaskStatus(task, userTask);
          status = taskStatus.status;
          remainingSeconds = taskStatus.remainingSeconds;
        }

        return {
          ...task,
          status,
          remaining_seconds: remainingSeconds,
        };
      });

      return mergedTasks;
    } catch (error) {
      throw new BadRequestException('Failed to fetch tasks');
    }
  }

  /**
   * Daily task'ı doğrular (Telegram kanalı, reklam vs.)
   */
  async verifyDailyTask(user_id: string, task_id: string) {
    try {
      const { user, task } = await this.findUserAndTask(user_id, task_id);

      // Daily task kontrolü
      this.validateDailyTask(task);

      // Zaten claim edilmiş mi?
      const currentStatus = user.daily_task_data?.[task.daily_task_match];
      if (
        currentStatus === EUserTaskStatus.READY_TO_CLAIM ||
        currentStatus === EUserTaskStatus.CLAIMED
      ) {
        throw new BadRequestException('Task already verified or claimed');
      }

      // Task tipine göre doğrulama yap
      await this.performDailyTaskVerification(user, task);

      // Durumu güncelle
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          user_id,
          {
            $set: {
              [`daily_task_data.${task.daily_task_match}`]:
                EUserTaskStatus.READY_TO_CLAIM,
            },
          },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }

      return {
        task: {
          _id: task_id,
          status: updatedUser.daily_task_data?.[task.daily_task_match],
        },
      };
    } catch (error) {
      console.error('Error in verifyDailyTask:', error);
      throw error;
    }
  }

  /**
   * Daily task ödülünü claim eder
   */
  async claimDailyTask(user_id: string, task_id: string) {
    try {
      const { user, task } = await this.findUserAndTask(user_id, task_id);

      // Daily task kontrolü
      this.validateDailyTask(task);

      // Claim edilebilir mi?
      const currentStatus = user.daily_task_data?.[task.daily_task_match];
      if (currentStatus !== EUserTaskStatus.READY_TO_CLAIM) {
        throw new BadRequestException('Task not ready to claim');
      }

      // Ödülü ver ve durumu güncelle
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          user_id,
          {
            $set: {
              [`daily_task_data.${task.daily_task_match}`]:
                EUserTaskStatus.CLAIMED,
            },
            $inc: {
              'daily_task_data.daily_task_reset_flag': 1,
              'balance_data.stone': task.reward,
            },
          },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }

      return {
        balance: updatedUser.balance_data,
        task: {
          _id: task_id,
          status: updatedUser.daily_task_data?.[task.daily_task_match],
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to claim task');
    }
  }

  /**
   * Fake mod (NONE API type) task başlatır - 15 dakika bekleme süresi
   */
  async startTask(user_id: string, task_id: string) {
    try {
      const { user, task } = await this.findUserAndTask(user_id, task_id);

      // Sadece fake mod tasklar için geçerli
      if (
        task.api_type !== ETaskAPIType.NONE ||
        task.task_type === ETaskType.DAILY
      ) {
        throw new BadRequestException('This task cannot be started manually');
      }

      // Zaten başlatılmış mı kontrol et
      const existingTask = user.tasks.find(
        (t) => t.task_id.toString() === task_id,
      );

      if (existingTask) {
        // Mevcut durumu döndür
        const taskStatus = this.calculateTaskStatus(task, existingTask);
        return {
          task: {
            _id: task_id,
            status: taskStatus.status,
            remaining_seconds: taskStatus.remainingSeconds,
          },
        };
      }

      // Task'ı başlat
      await this.userModel.updateOne(
        { _id: user_id },
        {
          $push: {
            tasks: {
              task_id: task_id,
              status: EUserTaskStatus.VERIFYING,
              started_at: new Date(),
            },
          },
        },
      );

      return {
        task: {
          _id: task_id,
          status: EUserTaskStatus.VERIFYING,
          remaining_seconds: this.FAKE_TASK_DURATION_MINUTES * 60,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to start task');
    }
  }

  /**
   * Fake mod task'ı claim eder (15 dakika sonra)
   */
  async claimTask(user_id: string, task_id: string) {
    try {
      const { user, task } = await this.findUserAndTask(user_id, task_id);

      // Task tipine göre claim işlemi
      if (task.task_type === ETaskType.DAILY) {
        return await this.claimDailyTask(user_id, task_id);
      }

      // Normal task claim
      const userTask = user.tasks.find((t) => t.task_id.toString() === task_id);

      // Zaten claim edilmiş mi?
      if (userTask?.status === EUserTaskStatus.CLAIMED) {
        throw new BadRequestException('Task already claimed');
      }

      // Fake mod task kontrolü
      if (task.api_type === ETaskAPIType.NONE) {
        return await this.claimFakeModeTask(user_id, task_id, task, userTask);
      }

      // API tabanlı tasklar için (şu an implement edilmemiş)
      throw new BadRequestException('API-based tasks not implemented yet');
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to claim task');
    }
  }

  /**
   * API tabanlı task'ı doğrular (Telegram API, X API vs.)
   * NOT: Şu an sadece yapı hazır, implementasyon gerekiyor
   */
  async verifyApiTask(user_id: string, task_id: string) {
    try {
      const { user, task } = await this.findUserAndTask(user_id, task_id);

      // Sadece API tabanlı tasklar için geçerli
      if (
        task.api_type === ETaskAPIType.NONE ||
        task.task_type === ETaskType.DAILY
      ) {
        throw new BadRequestException('This task cannot be verified via API');
      }

      // TODO: API tipine göre doğrulama
      // - TELEGRAM_API: Telegram kanal üyeliği kontrolü
      // - X_API: X (Twitter) takip kontrolü

      throw new BadRequestException('API verification not implemented yet');
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to verify task');
    }
  }

  // ================== PRIVATE HELPER METHODS ==================

  /**
   * User ve Task'ı veritabanından getirir
   */
  private async findUserAndTask(user_id: string, task_id: string) {
    const [user, task] = await Promise.all([
      this.userModel.findById(user_id).exec(),
      this.taskModel.findById(task_id).exec(),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { user, task };
  }

  /**
   * Daily task olup olmadığını kontrol eder
   */
  private validateDailyTask(task: Task) {
    if (task.task_type !== ETaskType.DAILY || !task.daily_task_match) {
      throw new BadRequestException('Task is not a daily task');
    }
  }

  /**
   * Daily task durumunu döndürür
   */
  private getDailyTaskStatus(
    user: UserDocument,
    dailyTaskMatch: string,
  ): EUserTaskStatus {
    return user.daily_task_data?.[dailyTaskMatch] || EUserTaskStatus.PENDING;
  }

  /**
   * Task durumunu ve kalan süreyi hesaplar
   */
  private calculateTaskStatus(task: Task, userTask: any) {
    let status = userTask.status;
    let remainingSeconds = 0;

    // Fake mod ve VERIFYING durumunda süre kontrolü
    if (
      task.api_type === ETaskAPIType.NONE &&
      status === EUserTaskStatus.VERIFYING
    ) {
      const now = new Date();
      const startTime = new Date(userTask.started_at);
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / 1000 / 60;

      if (elapsedMinutes >= this.FAKE_TASK_DURATION_MINUTES) {
        status = EUserTaskStatus.READY_TO_CLAIM;
      } else {
        remainingSeconds =
          this.FAKE_TASK_DURATION_MINUTES * 60 -
          (now.getTime() - startTime.getTime()) / 1000;
      }
    }

    return {
      status,
      remainingSeconds: remainingSeconds > 0 ? Math.floor(remainingSeconds) : 0,
    };
  }

  /**
   * Daily task doğrulamasını yapar (Telegram, reklam vs.)
   */
  private async performDailyTaskVerification(user: UserDocument, task: Task) {
    switch (task.daily_task_match) {
      case EDailyTaskMatch.JOIN_TG_CHANNEL_ROCK:
        const isMemberRock = await this.botService.isChatMember(
          Number(user._id),
          '@thememerock',
        );
        if (!isMemberRock) {
          throw new BadRequestException(
            'You must join the Memerock channel first',
          );
        }
        break;

      case EDailyTaskMatch.JOIN_TG_CHANNEL_DD:
        const isMemberDD = await this.botService.isChatMember(
          Number(user._id),
          '@deepdapp',
        );
        if (!isMemberDD) {
          throw new BadRequestException(
            'You must join the Deep DApp channel first',
          );
        }
        break;

      case EDailyTaskMatch.ADS_WATCHED:
        const adCount = user.ad_data?.ads_watched_daily ?? 0;
        if (adCount < task.limit) {
          throw new BadRequestException(
            `You need to watch ${task.limit} ads. Current: ${adCount}`,
          );
        }
        break;

      default:
        throw new BadRequestException('Unknown daily task type');
    }
  }

  /**
   * Fake mod task'ını claim eder
   */
  private async claimFakeModeTask(
    user_id: string,
    task_id: string,
    task: Task,
    userTask: any,
  ) {
    if (!userTask || userTask.status !== EUserTaskStatus.VERIFYING) {
      throw new BadRequestException('Task not started or already claimed');
    }

    // Süre kontrolü
    const now = new Date();
    const startTime = new Date(userTask.started_at);
    const elapsedMinutes = (now.getTime() - startTime.getTime()) / 1000 / 60;

    if (elapsedMinutes < this.FAKE_TASK_DURATION_MINUTES) {
      const remainingMinutes = Math.ceil(
        this.FAKE_TASK_DURATION_MINUTES - elapsedMinutes,
      );
      throw new BadRequestException(
        `Please wait ${remainingMinutes} more minute(s) before claiming`,
      );
    }

    // Ödülü ver ve durumu güncelle
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        user_id,
        {
          $set: {
            'tasks.$[task].status': EUserTaskStatus.CLAIMED,
          },
          $inc: {
            'balance_data.stone': task.reward,
          },
        },
        { new: true, arrayFilters: [{ 'task.task_id': task_id }] },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return {
      balance: updatedUser.balance_data,
      task: {
        _id: task_id,
        status: EUserTaskStatus.CLAIMED,
      },
    };
  }
}
