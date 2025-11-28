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
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,

    private readonly botService: BotService,
  ) {}

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
        let remainingTime = 0;

        if (task.task_type === ETaskType.DAILY && task.daily_task_match) {
          const dailyStatus = user.daily_task_data?.[task.daily_task_match];

          if (dailyStatus) {
            status = dailyStatus;
          }
        }
        if (userTask) {
          status = userTask.status;

          // EĞER Fake Mod ise ve durum VERIFYING ise süreyi kontrol et
          if (
            task.api_type === ETaskAPIType.NONE &&
            status === EUserTaskStatus.VERIFYING
          ) {
            const now = new Date();
            const startTime = new Date(userTask.started_at);
            const diffMinutes =
              (now.getTime() - startTime.getTime()) / 1000 / 60;

            // 15 dakika geçtiyse statüyü READY olarak frontend'e bildir (DB'yi update etmeye gerek yok, claim'de ederiz)
            if (diffMinutes >= 15) {
              status = EUserTaskStatus.READY_TO_CLAIM;
            } else {
              // Kalan saniyeyi hesapla
              remainingTime =
                15 * 60 - (now.getTime() - startTime.getTime()) / 1000;
            }
          }
        }
        return {
          ...task,
          status, // Frontend bu statüye göre buton gösterecek
          remaining_seconds: remainingTime > 0 ? Math.floor(remainingTime) : 0,
        };
      });
      return mergedTasks;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyDailyTask(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }
      if (task.task_type !== ETaskType.DAILY || !task.daily_task_match) {
        throw new BadRequestException('Task cannot be verified');
      }
      if (
        user.daily_task_data?.[task.daily_task_match] ===
          EUserTaskStatus.READY_TO_CLAIM ||
        user.daily_task_data?.[task.daily_task_match] ===
          EUserTaskStatus.CLAIMED
      ) {
        throw new BadRequestException('Task already verified or claimed');
      }
      let adCount = user.ad_data?.ads_watched_today ?? 0;
      let isMember = false;
      switch (task.daily_task_match) {
        case 'join_tg_channel_rock':
          isMember = await this.botService.isChatMember(
            Number(user_id),
            '@thememerock',
          );
          if (!isMember) {
            throw new BadRequestException(
              'User is not a member of the Memerock channel',
            );
          }
          break;
        case 'join_tg_channel_dd':
          isMember = await this.botService.isChatMember(
            Number(user_id),
            '@deepdapp',
          );
          if (!isMember) {
            throw new BadRequestException(
              'User is not a member of the Deep DApp channel',
            );
          }
          break;
        case 'ads_watched':
          if (adCount < task.limit) {
            throw new BadRequestException('User has not watched 10 ads');
          }
          break;
        default:
          break;
      }
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
        throw new Error('User not found');
      }
      return {
        task: {
          _id: task_id,
          status: updatedUser.daily_task_data?.[task.daily_task_match],
        },
      };
    } catch (error) {
      console.error('Error in claimDailyTask service:', error);
      throw error;
    }
  }

  async claimDailyTask(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }
      if (task.task_type !== ETaskType.DAILY || !task.daily_task_match) {
        throw new BadRequestException('Task cannot be claimed');
      }
      if (
        user.daily_task_data?.[task.daily_task_match] !==
        EUserTaskStatus.READY_TO_CLAIM
      ) {
        throw new BadRequestException('Task cannot be claimed');
      }
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
        throw new Error('User not found');
      }
      return {
        balance: updatedUser.balance_data,
        task: {
          _id: task_id,
          status: updatedUser.daily_task_data?.[task.daily_task_match],
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async startTask(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }
      if (
        task.api_type !== ETaskAPIType.NONE ||
        task.task_type === ETaskType.DAILY
      ) {
        throw new BadRequestException('Task cannot be started');
      }
      const existingTask = user.tasks.find(
        (t) => t.task_id.toString() === task_id,
      );
      // if already started, do nothing
      if (existingTask) return { status: existingTask.status };

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

      return { status: EUserTaskStatus.VERIFYING, started_at: new Date() };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyAndClaimTask(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }
      const userTaskIndex = user.tasks.findIndex(
        (t) => t.task_id.toString() === task_id,
      );
      const userTask = userTaskIndex > -1 ? user.tasks[userTaskIndex] : null;

      // 1. Durum: Zaten alınmış
      if (userTask?.status === EUserTaskStatus.CLAIMED) {
        throw new BadRequestException('Task already claimed');
      }
      if (task.api_type === ETaskAPIType.NONE) {
        if (!userTask || userTask.status !== EUserTaskStatus.VERIFYING) {
          throw new BadRequestException('Task not started properly');
        }

        const now = new Date();
        const startTime = new Date(userTask.started_at);
        const diffMinutes = (now.getTime() - startTime.getTime()) / 1000 / 60;

        if (diffMinutes < 15) {
          // Test için 15 dakika
          throw new BadRequestException(
            `Verification in progress. Wait ${Math.ceil(15 - diffMinutes)} mins.`,
          );
        }

        const updatedUser = await this.userModel
          .findByIdAndUpdate(
            user_id,
            {
              $set: {
                'tasks.$[task].status': EUserTaskStatus.CLAIMED,
              },
              $inc: {
                'daily_task_data.daily_task_reset_flag': 1,
                'balance_data.stone': task.reward,
              },
            },
            { new: true, arrayFilters: [{ 'task.task_id': task_id }] },
          )
          .exec();
        if (!updatedUser) {
          throw new Error('User not found');
        }
        return {
          balance: updatedUser.balance_data,
          task: {
            _id: task_id,
            is_claimed: true,
          },
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async claimReward(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }

      if (task.task_type === ETaskType.DAILY) {
        const taskStatus = user.daily_task_data?.[task.daily_task_match];
        if (taskStatus !== EUserTaskStatus.READY_TO_CLAIM) {
          throw new BadRequestException('Task not available to claim');
        }
      }
      if (
        user.tasks.find((t) => t.task_id.toString() === task_id)?.status !==
        EUserTaskStatus.READY_TO_CLAIM
      ) {
        throw new BadRequestException('Task not available to claim');
      }
      const updatedUser = await this.userModel;
    } catch (error) {}
  }
}
